const {
  GetCallCenterDataAttribute,
} = require("../../repositories/center.repository");
const {
  getClientByAttribute,
  getAllClients,
  deleteClient,
  CreateClient,
} = require("../../repositories/client.repository");

exports.checkClient = async (clientGovId) => {
  return await getClientByAttribute("gov_id", clientGovId);
};

exports.getClientByAttribute = async (attribute, value) => {
  try {
    const client = await getClientByAttribute(attribute, value);
    return client;
  } catch (error) {
    throw "error while getting client from db client repo : " + error;
  }
}

exports.createClient = async (newClient, transaction) => {
  return await CreateClient(newClient, transaction);
};

// exports.getClient = async (clientId) => {
//   // Implement the logic to get a client by ID
// };

exports.deleteClient = async (clientId) => {
  return await deleteClient(clientId);
};

exports.getClients = async () => {
  return await getAllClients();
};

exports.createResitrationCode = async (client) => {
  const { firstname, lastname } = client;
  const  country  = await GetCallCenterDataAttribute("country");
  const  location  = await GetCallCenterDataAttribute("location");
  const createResitrationNumber = async () => {
    const generateNumber = () => Math.floor(Math.random() * 9000000) + 1000000;
    const firstnameCode = firstname.slice(0, 1).toUpperCase();
    const lastnameCode = lastname.slice(0, 1).toUpperCase();
    const locationCode = location.slice(0, 2).toUpperCase();
    const countrycode = country.slice(0, 2).toUpperCase();
    const registrationNumber = `${countrycode}${locationCode}${firstnameCode}${lastnameCode}${generateNumber()}`;
    return registrationNumber;
  };
  const registrationNumber = await createResitrationNumber();
  const exist = await getClientByAttribute(
    "registration_number",
    registrationNumber
  );
  if (exist) {
    return await createResitrationNumber(client, location);
  } else {
    return registrationNumber;
  }
};
