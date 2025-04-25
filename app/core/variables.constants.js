exports.JWTSECRET = "secret"

exports.RES_MESSAGES = {
  MISSING_PARAMETERS: "missing_parameters",
  INVALID_PARAMETERS: "invalid_parameters",
  SERVER_ERROR: "server_error",


  AUTH: {
    SUCCESS: {
      CONNECTED_SUCCESSFULLY: "connected_successfully",
      VALID_TOKEN: "token_is_valid",
      USER_CREATED: "user_created",
    },
    ERROR: {
      WRONG_INFORMATIONS: "invalid_informations",
      ERROR_WHILE_SIGNIN: "error_while_signin",
      NO_TOKEN: "no_token_provided",
      INVALID_TOKEN: "token_expired_or_expired",
      EMAIL_EXISTED: "email_existed",
    },
  },

  PROPERTY: {
    SUCCESS: {
      CREATED: "property_created",
      FOUND: "property_found",
      FOUND_ALL: "properties_found",
      UPDATED: "property_updated",
      DELETED: "property_deleted"
    },

    ERROR: {
      NOT_FOUND: "property_not_found",
    },
  },

  RESERVATION: {
    SUCCESS: {
      CREATED: "reservation_created",
      FOUND: "reservation_found",
      FOUND_ALL: "reservations_found",
      UPDATED: "reservation_updated",
      DELETED: "reservation_deleted"
    },

    ERROR: {
      NOT_FOUND: "reservation_not_found",
      PHONE: "reservations_with_phone_not_found",
      PROPERTY: "reservations_with_property_not_found",
    },
  }
};
