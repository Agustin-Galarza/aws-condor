//@ts-nocheck
import axios from 'axios';
import userStore from '../store/userStore';

const axiosClient = axios.create({
	baseURL: `${import.meta.env.BASE_URL}`,
});

export const getReports = async (neighborhood: string) => {
	const response = await axiosClient.get(
		`${import.meta.env.VITE_API_URL}/reports?groupId=${neighborhood}`,
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
		`${import.meta.env.VITE_API_URL}/reports`,
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
	const response = await axiosClient.get(
		`${import.meta.env.VITE_API_URL}/groups`,
		{
			headers: {
				Authorization: `Bearer ${userStore.getState().token}`,
			},
		}
	);
	return response.data;
};

export const addUser = async (username: string) => {
	const response = await axiosClient.post(
		`${import.meta.env.VITE_API_URL}/users`,
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
