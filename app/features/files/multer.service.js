const multer = require('multer');

const propertyImageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/property');
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}`);
	}
});
const uploadPropertyImage = multer({ storage: propertyImageStorage });


const userImageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/users');
	},
	filename: (req, file, cb) => {
		cb(null, `${req.user.id}`);
	}
});
const userImage = multer({ storage: userImageStorage });

module.exports = uploadPropertyImage;
module.exports = userImage;


exports.UploadFile = async (file) => {

	try {
		console.log(`${file}- Created`);
		return {
			status: true,
			fileName: `${Date.now()}`
		}
	} catch (error) {
		return {
			status: false,
			message: error.message
		}
	}
}