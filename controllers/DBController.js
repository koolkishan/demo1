//Get the database connection
const client = require("../DBConnection");

//Delete the Roles Database
module.exports.deleteDBRoles = async function (request, h) {
  const result = await client.indices.delete({
    index: "roles",
  });
  return result;
};

//Create the Roles Database
module.exports.createDBRoles = async function (request, h) {
  const result = await client.indices.create({
    index: "roles",
  });
  return result;
};

//Delete the User Database
module.exports.deleteUserDB = async function (request, h) {
  const result = await client.indices.delete({
    index: "users",
  });
  return result;
};

//Create the User Database
module.exports.createUserDB = async function (request, h) {
  const result = await client.indices.create({
    index: "users",
  });
  return result;
};

//Create the Games Database
module.exports.createGameDB = async function (request, h) {
  const reuslt = await client.indices.create({
    index: "games",
  });
  return result;
};

//Delete the Games Database
module.exports.deleteGamesDB = async function (request, h) {
  const result = await client.indices.delete({
    index: "games",
  });
  return result;
};
