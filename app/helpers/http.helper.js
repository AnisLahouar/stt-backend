const axiosInstance = require("../core/axios.config");
const { UPLOAD_IMAGE_API } = require("../core/api.constants");

exports.uploadImageToCDN = async (image, fileName) => {

    const response = await axiosInstance.post(UPLOAD_IMAGE_API, {
      image,
      fileName,
    });
    return response.data;
 
};
