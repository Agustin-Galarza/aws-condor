const dynamo = require('../resources/lambda_sources/lib/dynamo');

const GROUPS = ['Quilmes', 'Berazategui', 'Juan'];

GROUPS.forEach(groupname => {
	dynamo
		.createGroup(groupname)
		.then(res => console.log(`Group ${groupname} created`))
		.catch(err =>
			console.log(`Error. ${groupname} could not be created:\n`, err)
		);
});
