import axios from "axios";

export const getReports = async (neighborhood: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/reports/${neighborhood}`
  );
  return response.data;
};

export const postNewReport = async (report: string) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/reports`,
    report
  );
  return response.data;
};

export const getNeighborhoods = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/neighborhoods`
  );
  return response.data;
};
