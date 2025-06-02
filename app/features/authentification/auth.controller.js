const { HttpStatus } = require("../../core/http_status.constants");
const { RES_MESSAGES } = require("../../core/variables.constants");
const { User } = require("../../database");
const { createToken } = require("../../helpers/jwt.helper");
const ResHandler = require("../../helpers/responseHandler.helper");

exports.signup = async (req, res) => {
  // #swagger.tags = ['Authentification']

  const resHandler = new ResHandler(res);
  try {
    const { email, name, password, role } = req.body;
    if (role == "admin") {
      resHandler.setSuccess(
        HttpStatus.OK,
        RES_MESSAGES.AUTH.SUCCESS.USER_CREATED,
        { email, name, password, role }
      );
      return resHandler.send(res);
    }
    const existedUser = await User.findOne({ where: { email } });
    if (existedUser) {
      resHandler.setError(
        HttpStatus.BAD_REQUEST,
        RES_MESSAGES.AUTH.ERROR.EMAIL_EXISTED
      );
      return resHandler.send(res);
    }
    const newUser = await User.create({ email, name, password, role });
    delete newUser.dataValues.password;
    delete newUser.dataValues.createdAt;
    delete newUser.dataValues.updatedAt;
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.AUTH.SUCCESS.USER_CREATED,
      newUser
    );
    return resHandler.send(res);
  } catch (error) {
    console.log(error);
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

exports.signin = async (req, res) => {
  // #swagger.tags = ['Authentification']

  const resHandler = new ResHandler(res);
  try {
    const { email, password } = req.body;
    const trimmedEmail = email.trim();
    const user = await User.findOne({ where: { email: trimmedEmail } });
    if (!user) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.USER.ERROR.NOT_FOUND);
      return resHandler.send(res);
    }
    if (user.status != 'active') {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.USER.ERROR.INACTIVE);
      return resHandler.send(res);
    }
    if (user.password !== password) {
      resHandler.setError(HttpStatus.BAD_REQUEST, RES_MESSAGES.USER.ERROR.WRONG_PASSWORD);
      return resHandler.send(res);
    }
    const token = createToken(user.id, "1y");
    delete user.dataValues.password;
    resHandler.setSuccess(HttpStatus.OK, RES_MESSAGES.USER.SUCCESS.FOUND, {
      user,
      token
    });
    return resHandler.send(res);
  } catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

exports.getAuthenticatedUser = async (req, res) => {

  const resHandler = new ResHandler(res);
  try {
    const user = req.user
    user.password = "";
    resHandler.setSuccess(
      HttpStatus.OK,
      RES_MESSAGES.USER.SUCCESS.FOUND,
      user
    );
    return resHandler.send(res);
  } catch (error) {
    resHandler.setError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      RES_MESSAGES.SERVER_ERROR
    );
    return resHandler.send(res);
  }
};

async function saveProfileImage(imageUrl, userId) {
  try {
    // Define the local path to save the image
    const imagePath = path.join(__dirname, "images", `${userId}-profile.jpg`);

    // Fetch the image from the URL
    const response = await axios.get(imageUrl, { responseType: "stream" });

    // Save the image locally
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(imagePath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error saving profile image:", error);
    throw error;
  }
}
