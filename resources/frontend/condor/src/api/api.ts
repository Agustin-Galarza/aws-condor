//@ts-nocheck
import axios from 'axios';
import userStore from '../store/userStore';

const axiosClient = axios.create({
	baseURL: `${import.meta.env.BASE_URL}`,
});

const STAGE_NAME = 'dev';

export type User = {
	username: string;
	group: string;
};

export type Group = {
	name: string;
	members: string[];
};

export type Report = {
	id: string; // uuid
	message: string | null;
	imageUrl: string | null;
	from: string; // username
	group: string; // group name
	sentAt: string; // ISO date
};

export type Collection<T> = {
	count: number;
	data: T[];
};

export type PostReportBody = {
	username: string;
	message: string | null;
	imageUrl: string | null;
};

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
	return response.data as Collection<Report>;
};

export const postNewReport = async (username: string, report: string) => {
	const reportBody: PostReportBody = {
		username,
		message: report,
		imageUrl: null,
	};
	const response = await axiosClient.post(
		`${apiBaseUrl()}/reports`,
		reportBody,
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
			username,
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
	return response.data as Collection<Group>;
};
