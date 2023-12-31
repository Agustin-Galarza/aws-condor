//@ts-nocheck
import axios from 'axios';
import userStore from '../store/userStore';

const axiosClient = axios.create({
	baseURL: `${import.meta.env.BASE_URL}`,
});

const STAGE_NAME = 'dev';

const apiBaseUrl = () =>
	`https://${import.meta.env.VITE_CLOUDFRONT_URL}/${STAGE_NAME}`;

export const getReports = async (neighborhood: string) => {
	const response = await axiosClient.get(
		`${apiBaseUrl()}/reports?groupId=${neighborhood}`,
		{
			headers: {
				Authorization: `Bearer ${userStore.getState().token}`,
			},
		}
	);
	return response.data;
};

export const postNewReport = async (username: string, report: string) => {
	const response = await axiosClient.post(
		`${apiBaseUrl()}/reports`,
		{
			userId: username,
			report,
		},
		{
			headers: {
				Authorization: `Bearer ${userStore.getState().token}`,
			},
		}
	);
	return response.data;
};

export const getNeighborhoods = async () => {
	const response = await axiosClient.get(`${apiBaseUrl()}/groups`, {
		headers: {
			Authorization: `Bearer ${userStore.getState().token}`,
		},
	});
	return response.data;
};

export const addUser = async (username: string) => {
	const response = await axiosClient.post(
		`${apiBaseUrl()}/users`,
		{
			data: {
				username,
			},
		},
		{
			headers: {
				Authorization: `Bearer ${userStore.getState().token}`,
			},
		}
	);
	return response.data;
};

export const getUser = async (username: string) => {};

export const getGroups = async () => {
	const response = await axiosClient.get(`${apiBaseUrl()}/groups`, {
		headers: {
			Authorization: `Bearer ${userStore.getState().token}`,
		},
	});
	console.log('Get groups response: ', response);
	return response.data;
};
