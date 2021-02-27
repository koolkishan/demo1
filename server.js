/*
Created By :- Kishan Sheth
Tech Stack :-  
  Languages
    Node.js
    Hapijs
  Database 
    ElasticSearch
Developed as a part of Rapidops Exercise
Here the data is used of some popular games
*/

//Requiring Hapijs
const Hapi = require("@hapi/hapi");

//All the business logic for the API's are divided into their individual controllers

//All the logic for roles are writtern in RoleController file
const RoleController = require("./controllers/RoleController");
//All the logic for users are writtern in UserController file
const UserController = require("./controllers/UserController");
//All the logic for database creation/deletion are writtern in DBController file
const DBController = require("./controllers/DBController");
//All the logic for Data[Game] are writtern in GameController file
const GameController = require("./controllers/GameController");
//All the logic for roles are writtern in RoleController file
const AuthController = require("./controllers/AuthController");

// Starting the app
const init = async () => {
  //Start the app and store the instance on the server variable
  const server = Hapi.server({
    port: process.env.PORT,
    host: "glacial-forest-78349.herokuapp.com",
  });

  await server.start();
  //Whern Server is started display a message in the console.
  console.log("Server running on %s", server.info.uri);

  //The Routes Starts from here

  //DB ROUTES

  //Creates the Database for the Games
  server.route({
    method: "GET",
    path: "/createGamesDB",
    options: {
      cors: true,
      handler: DBController.createGameDB,
    },
  });

  //Creates the Database for the Users
  server.route({
    method: "POST",
    path: "/createDB",
    handler: DBController.createUserDB,
  });

  //Deletes the Database for the User
  server.route({
    method: "POST",
    path: "/deleteDB",
    handler: DBController.deleteUserDB,
  });

  //Creates the Database for the Roles
  server.route({
    method: "POST",
    path: "/createDBRoles",
    handler: DBController.createDBRoles,
  });

  //Deletes the Database for the Games
  server.route({
    method: "DELETE",
    path: "/deleteDBGames",
    handler: DBController.deleteGamesDB,
  });

  //Deletes the Database for the Roles
  server.route({
    method: "POST",
    path: "/deleteDBRoles",
    handler: DBController.deleteDBRoles,
  });

  //AUth Routes

  //handles the login of the user
  server.route({
    method: "POST",
    path: "/login",
    options: {
      cors: true,
      handler: AuthController.login,
    },
  });

  //ROles ROutes

  //updates the role
  server.route({
    method: "PATCH",
    path: "/updateRole",
    options: {
      cors: true,
      handler: RoleController.updateRole,
    },
  });

  //Get all the Roles
  server.route({
    method: "GET",
    path: "/getRolesForCreateUser",
    options: {
      cors: true,
      handler: RoleController.getRolesForUserCreate,
    },
  });

  //Get Specific Role
  server.route({
    method: "GET",
    path: "/getRole/{id}",
    options: {
      cors: true,
      handler: RoleController.getRole,
    },
  });

  //Add new Roles
  server.route({
    method: "POST",
    path: "/addRoles",
    options: {
      cors: true,
      handler: RoleController.addRoles,
    },
  });

  //Get Roles
  server.route({
    method: "GET",
    path: "/getRoles",
    options: {
      cors: true,
      handler: RoleController.getRoles,
    },
  });

  //Search Data for a specific user like what roles and modules are assigned to them and according to
  //that get the game data
  server.route({
    method: "POST",
    path: "/searchUserData",
    options: {
      cors: true,
      handler: UserController.searchUserData,
    },
  });

  //Handles the Deletion of the Role
  server.route({
    method: "DELETE",
    path: "/deleteRoles",
    options: {
      cors: true,
      handler: RoleController.deleteRole,
    },
  });

  //Users Routes

  //Get Specific user data
  server.route({
    method: "GET",
    path: "/getUser/{id}",
    options: {
      cors: true,
      handler: UserController.getUser,
    },
  });

  //Update the user
  server.route({
    method: "PATCH",
    path: "/updateUser",
    options: {
      cors: true,
      handler: UserController.updateUser,
    },
  });

  //Search the users for specific users
  server.route({
    method: "POST",
    path: "/searchUsers",
    options: {
      cors: true,
      handler: UserController.searchUser,
    },
  });

  //Search Roles for speicific roles
  server.route({
    method: "POST",
    path: "/searchRoles",
    options: {
      cors: true,
      handler: RoleController.searchRole,
    },
  });

  //Deletes the user, if the user role is not admin
  server.route({
    method: "DELETE",
    path: "/deleteUser",
    options: {
      cors: true,
      handler: UserController.deleteUser,
    },
  });

  //Deletes the admin, if the user role is not user
  server.route({
    method: "DELETE",
    path: "/deleteAdmin",
    options: {
      cors: true,
      handler: UserController.deleteAdmin,
    },
  });

  //Games Routes
  //Adds demo data to the database
  server.route({
    method: "GET",
    path: "/insertGameData",
    options: {
      cors: true,
      handler: GameController.insertGameData,
    },
  });

  //Get all games
  server.route({
    method: "GET",
    path: "/getGames",
    options: {
      cors: true,
      handler: GameController.getAllGames,
    },
  });

  //Get all users
  server.route({
    method: "POST",
    path: "/getUsers",
    options: {
      cors: true,
      handler: UserController.getAllUsers,
    },
  });

  //Get the data for user
  server.route({
    method: "POST",
    path: "/getUserData",
    options: {
      cors: true,
      handler: UserController.getUserData,
    },
  });

  //Creates new user
  server.route({
    method: "POST",
    path: "/createUser",
    options: {
      cors: true,
      handler: UserController.CreateUser,
    },
  });

  //Creates new admin
  server.route({
    method: "POST",
    path: "/createAdmin",
    options: {
      cors: true,
      handler: UserController.CreateAdmin,
    },
  });

  //Checks the authorization for the admin
  server.route({
    method: "POST",
    path: "/authorize",
    options: {
      cors: true,
      handler: AuthController.authorize,
    },
  });

  //Checks the authorization for the user
  server.route({
    method: "POST",
    path: "/authorizeUser",
    options: {
      cors: true,
      handler: AuthController.authorizeUser,
    },
  });

  //Exit on error
  process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
  });
};
init();
