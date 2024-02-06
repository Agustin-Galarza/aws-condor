import axios from "axios";
import userStore from "../store/userStore";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.BASE_URL}`,
});

const STAGE_NAME = "dev";

export type User = {
  username: string;
  group: string;
};

export type DownlodableImage = {
  url: string;
  expiresInSeconds: number;
};

export type Group = {
  name: string;
  members: string[];
};

export type GetGroupsResponce = {
  count: number;
  data: {
    name: string;
    members: string[];
  }[];
};

export type Report = {
  id: string; // uuid
  message: string | null;
  imageId: string | null;
  from: string; // username
  group: string; // group name
  sentAt: string; // ISO date
};

export type GetReportsResponce = {
  count: number;
  data: Report[];
};

export type PutReportRequest = {
  message: string | null;
  username: string;
  imageId: string | null;
};

export type UplodableImage = {
  url: string;
  imageId: string;
  expiresInSeconds: number;
};

export type PutImageRequest = {
  mimeType: string;
};

export type Collection<T> = {
  count: number;
  data: T[];
};

export type PostReportBody = {
  user: string;
  message: string | null;
  image: File | null;
};

const apiBaseUrl = () =>
  `https://${import.meta.env.VITE_CLOUDFRONT_URL}/${STAGE_NAME}`;

export const createNewGroup = async (groupName: string) => {
  const response = await axiosClient.post(
    `${apiBaseUrl()}/groups`,
    { groupName },
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
      },
    }
  );
  return response.data;
};

export const addMemberToGroup = async (
  groupName: string,
  userEmail: string
) => {
  const response = await axiosClient.post(
    `${apiBaseUrl()}/groups/${groupName}/addMember`,
    { email: userEmail },
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
      },
    }
  );
  return response.data;
};

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

export const getReportsFromGroup = async (
  groupName: string
): Promise<GetReportsResponce> => {
  const response = await axiosClient.get(
    `${apiBaseUrl()}/groups/${groupName}/reports`,
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
      },
    }
  );
  return response.data;
};

//TODO : ACTUALIZAR el front a mano en el s3, y borrar el cache en cloudfront con /*

/*
	Flujo
	upload link -> url de upload y id
	post con la image a ese upload link
	se sube el id de la image a la base de datos
*/

export const createNewReport = async (
  email: string,
  report: string,
  image: File
) => {
  const formData = new FormData();
  formData.append("user", email);
  formData.append("message", report);
  formData.append("image", image);

  const response = await axiosClient.postForm(
    `${apiBaseUrl()}/reports`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
        "Content-Type": "multipart/form-data",
        Boundary: "----WebKitFormBoundary7MA4YWxkTrZu0gW",
      },
    }
  );
  return response.data;
};

export const addUser = async (email: string, group: string) => {
  const response = await axiosClient.post(
    `${apiBaseUrl()}/users`,
    {
      email,
      group,
    },
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
      },
    }
  );
  return response.data;
};

// export const getUser = async (username: string) => {};

export const getGroups = async () => {
  const response = await axiosClient.get(`${apiBaseUrl()}/groups`, {
    headers: {
      Authorization: `Bearer ${userStore.getState().token}`,
    },
  });
  console.log("Get groups response: ", response);
  return response.data as Collection<Group>;
};

export const getUploadLink = async (
  mimeType: string
): Promise<UplodableImage> => {
  const response = await axiosClient.post(
    `${apiBaseUrl()}/images/uploadLink`,
    { mimeType },
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
      },
    }
  );
  return response.data;
};

export const getImage = async (imageId: string): Promise<string> => {
  const response = await axiosClient.get(
    `${apiBaseUrl()}/images/${imageId}/downloadurl`,
    {
      headers: {
        Authorization: `Bearer ${userStore.getState().token}`,
      },
    }
  );
  return response.data;
};
