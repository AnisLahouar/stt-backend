const axios = require("axios");
const { GetCallCenterData } = require("../repositories/center.repository");

const axiosInstance = axios.create({
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});
axiosInstance.interceptors.request.use(
  async (config) => {
    const {token , id} = await GetCallCenterData();

    config.headers.Authorization =  token && `${token}`;
    config.headers.CenterId =  id && `${id}`;

    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
module.exports = axiosInstance;
