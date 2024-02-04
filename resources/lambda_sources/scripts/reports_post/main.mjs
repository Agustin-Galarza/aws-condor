import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';
import * as sns from '/opt/nodejs/sns.mjs';
import * as s3 from '/opt/nodejs/s3.mjs';
import Busboy from 'busboy';

/**
 * POST Request:
 * - Body (multipart/form-data): {
 *
 * 		user: string, // user's email
 * 		message: string|null, // The message associated with this report
 *		image: file|null, // The image associated with this report
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	let email = null;
	let message = null;
	let image = null;
	try {
		const { fields, files } = await getFormData(event);
		/** @type {string} */
		email = fields.user;
		/** @type {string|null} */
		message = fields.message ?? null;
		image = files.image;
	} catch (err) {
		console.error('Error parsing form data', err);
		return response.badRequest('Error parsing form data: ' + err.message);
	}

	if (!email) {
		return response.badRequest('Missing user email');
	}

	try {
		const user = await dynamo.findUser(email);
		console.log('User', user);
		if (user === null) {
			return response.notFound('User not found');
		}
		if (user.group === null) {
			return response.badRequest('User does not belong to a group');
		}
		const group = await dynamo.findGroup(user.group);
		if (group === null) {
			console.error(`Group could not be found for request: ${user.group}`);
			return response.serverError('Group not found');
		}

		/** @type {string|null} */
		let imageId = null;
		if (image) {
			console.log('Creating image with:', image.filename.mimeType);
			imageId = await dynamo.createImage(
				user.email,
				group.name,
				image.filename.mimeType
			);
			if (imageId === null) {
				console.error('Could not create image in dynamo');
				return response.serverError('Error creating image');
			}
			const added = await s3.putObject(image.data, imageId);
			if (!added) {
				console.error('Could not upload image to S3');
				const res = await dynamo.deleteImage(imageId);
				if (!res.success) {
					console.error(
						'FATAL: could not delete image from dynamo after failing to upload to S3'
					);
				}
				return response.serverError('Error uploading image');
			}
		}
		// Upload report
		const reportId = await dynamo.createReport(user, {
			message,
			imageId,
		});
		if (reportId.success === false) {
			console.error('Could not upload report to dynamo.');
			return response.serverError('Error creating report: ', reportId.message);
		}
		// Notify group
		if (process.env.CLOUDFRONT_DOMAIN_NAME == undefined) {
			console.error('Cloudfront domain name not set');
			return response.serverError('Error creating report');
		}

		const success = await sns.publish(
			group.topicArn,
			'New Alert in your group',
			buildTextMessage(group, user, message, imageId, reportId)
		);
		if (!success) {
			return response.serverError(
				'Error notifying group. Report was uploaded successfully. '
			);
		}

		return response.ok(reportId);
	} catch (err) {
		console.error('Error creating report', err);
		return response.serverError('Error creating report');
	}
};

const buildTextMessage = (group, user, message, imageId, reportId) => {
	let reportMessage = `New Alert in ${group.name}\nThere is a new report from ${user.email}`;
	if (message != null) {
		reportMessage += `\nThey left the following message:\n${message}`;
	}
	reportMessage += '\n';
	if (imageId != null) {
		const imageUrl = `https://${process.env.CLOUDFRONT_DOMAIN_NAME}/dev/images/${imageId}`;
		reportMessage += `\nYou can view the related image at ${imageUrl}`;
	}
	const reportUrl = `https://${process.env.CLOUDFRONT_DOMAIN_NAME}/dev/reports/${reportId}`;
	reportMessage += `\nYou can view the full report at ${reportUrl}`;
	return reportMessage;
};

const getFormData = async event => {
	return new Promise((resolve, reject) => {
		const busboy = Busboy({
			headers: { 'content-type': event.headers['Content-Type'] },
		});
		const fields = {};
		const files = {};
		busboy.on('field', (fieldname, val) => {
			if (!['user', 'message'].includes(fieldname)) {
				throw new Error('Invalid field ' + fieldname);
			}
			fields[fieldname] = val;
		});
		busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
			if (fieldname !== 'image') {
				throw new Error('Invalid file with name ' + fieldname);
			}
			const chunks = [];
			file.on('data', data => {
				chunks.push(data);
			});
			file.on('end', () => {
				files[fieldname] = {
					filename,
					mimetype,
					data: Buffer.concat(chunks),
				};
			});
		});
		busboy.on('finish', () => {
			resolve({ fields, files });
		});
		busboy.on('error', err => {
			reject(err);
		});
		busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
		busboy.end();
	});
};
