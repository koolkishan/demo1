//Get the database connection
const client = require("../DBConnection");
//Bcrypt package is used for password hashing
const bcrypt = require("bcrypt");
//jwt is used for token management
const jwt = require("jsonwebtoken");

//Creates the new user
module.exports.CreateUser = async function (request, h) {
  //hash the password
  const password = await bcrypt.hash(request.payload.password, 10);
  let result = await client.index({
    index: "users",
    body: {
      username: request.payload.username,
      firstName: request.payload.firstName,
      lastName: request.payload.lastName,
      email: request.payload.email,
      password,
      status: request.payload.status,
      type: "user",
      roles: request.payload.roles,
    },
  });

  result = await result;
  result = result.body;
  const userId = result._id;

  const rolesID = [];
  request.payload.roles.forEach((role) =>
    rolesID.push({ _index: "roles", _id: role.id })
  );
  let roles = client.mget({
    body: {
      docs: rolesID,
    },
  });

  roles = await roles;
  const roleArray = [];
  roles.body.docs.forEach((role) => roleArray.push(role));

  roleArray.forEach((role) => {
    role._source.users.push(userId);
  });
  console.log("here");
  for (let i = 0; i < roleArray.length; i++) {
    console.log("here");
    await client
      .index({
        index: "roles",
        id: roleArray[i]._id,
        body: {
          name: roleArray[i]._source.name,
          description: roleArray[i]._source.description,
          modules: roleArray[i]._source.modules,
          users: roleArray[i]._source.users,
        },
      })
      .catch((err) => {
        console.log(err.meta);
        return err;
      });
  }

  console.log(roleArray);

  //return the message
  return { msg: "success" };
};

//update the user
module.exports.updateUser = async function (request, h) {
  const user = await client
    .get({
      index: "users",
      id: request.payload.id,
    })
    .catch((err) => console.log(err));
  console.log(user.body._source.roles);
  console.log(request.payload.roles);
  const toBeAdded = [];
  const toBeDeleted = [];

  //tobeAdded

  request.payload.roles.forEach((role) => {
    const index = user.body._source.roles.findIndex((el) => el.id === role.id);
    if (index === -1) {
      toBeAdded.push(role.id);
    }
  });

  user.body._source.roles.forEach((role) => {
    const index = request.payload.roles.findIndex((el) => el.id === role.id);
    if (index === -1) {
      toBeDeleted.push(role.id);
    }
  });
  console.log(toBeAdded, toBeDeleted);

  for (let i = 0; i < toBeAdded.length; i++) {
    const role = await client
      .get({
        index: "roles",
        id: toBeAdded[i],
      })
      .catch((err) => console.log(err));
    role.body._source.users.push(request.payload.id);
    await client
      .index({
        index: "roles",
        id: role.body._id,
        body: role.body._source,
      })
      .catch((err) => {
        console.log(err.meta);
        return err;
      });
  }

  for (let i = 0; i < toBeDeleted.length; i++) {
    const role = await client
      .get({
        index: "roles",
        id: toBeDeleted[i],
      })
      .catch((err) => console.log(err));

    const index = role.body._source.users.indexOf(request.payload.id);
    role.body._source.users.splice(index, 1);

    await client
      .index({
        index: "roles",
        id: role.body._id,
        body: role.body._source,
      })
      .catch((err) => {
        console.log(err.meta);
        return err;
      });
  }
  // hash the password
  const password = await bcrypt.hash(request.payload.password, 10);
  //index the user by the same id to update it
  await client
    .index({
      index: "users",
      id: request.payload.id,
      body: {
        username: request.payload.username,
        firstName: request.payload.firstName,
        lastName: request.payload.lastName,
        email: request.payload.email,
        password,
        status: request.payload.status,
        type: "user",
        roles: request.payload.roles,
      },
    })
    .catch((err) => {
      console.log(err.meta);
      return err;
    });
  //return msg if no errors are there
  return { msg: "success" };
};

//Gets all the users from the index users
module.exports.getAllUsers = async function (request, h) {
  //refresh the index
  await client.indices.refresh({ index: "users" });
  //gets all the users from the index by match_all query
  const result = await client.search({
    index: "users",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  //sends the results
  return result.body.hits.hits;
};

//Get specific user
module.exports.getUser = async function (request, h) {
  //Refresh the index
  await client.indices.refresh({ index: "users" });
  //Get the user by sending the id in the request
  const result = await client
    .get({
      index: "users",
      id: request.params.id,
    })
    .catch((err) => console.log(err));
  //return the user data
  return result.body._source;
};

//Deletes the user only if the user type is user
module.exports.deleteUser = async function (request, h) {
  //first get the user by sending the id in the request
  let userData = await client
    .get({
      index: "users",
      id: request.payload.id,
    })
    .catch((err) => console.log(err));
  //get the user data from the body
  userData = await userData.body._source;
  console.log(userData);
  for (let i = 0; i < userData.roles.length; i++) {
    console.log("here");
    const role = await client
      .get({
        index: "roles",
        id: userData.roles[i].id,
      })
      .catch((err) => console.log(err));
    const roleArray = role.body._source.users;
    const index = role.body._source.users.indexOf(request.payload.id);
    console.log(index);
    role.body._source.users.splice(index, 1);
    await client
      .index({
        index: "roles",
        id: role.body._id,
        body: role.body._source,
      })
      .catch((err) => {
        console.log(err.meta);
        return err;
      });
  }
  //if the user type is admin then send msg that admin cannot be deleted
  if (userData.type === "admin") {
    return { msg: "Admin cannot be deleted", status: 204 };
  } else {
    //else delete the user from the database
    await client.delete({
      index: "users",
      type: "_doc",
      id: request.payload.id,
    });
    //refresh the index
    await client.indices.refresh({ index: "users" });
    //get all the users and send it to the user
    const result = await client.search({
      index: "users",
      body: {
        query: {
          match_all: {},
        },
      },
    });
    //return all the users
    return result.body.hits.hits;
  }
};

//Get specific user data
module.exports.getUserData = async function (request, h) {
  //get the token
  const token = request.payload.token;
  //decode the token and take id from it
  const { id } = jwt.decode(token, "a");
  //refresh the user index
  await client.indices.refresh({ index: "users" });
  //get the user data by sending the id
  let userData = await client
    .get({
      index: "users",
      id,
    })
    .catch((err) => console.log(err));
  userData = await userData.body._source;
  //get the roles of the user from the userdata
  const roles = userData.roles;
  //stores all the roles individually for getting the data
  const x = [];
  //get all the assigned roles of the user and push it to the array x
  roles.forEach((el) => x.push({ _index: "roles", _id: el.id }));
  //multi get all the roles from the roles index
  const role = client.mget({
    body: {
      docs: x,
    },
  });
  //gets all the roles Details with the modules that has been assigned to the user
  const allRoles = (await role).body.docs;
  //stores all the modules individually
  let modules = [];
  //push all the modules from the roles to the modules array
  allRoles.forEach((el) => {
    modules.push(el._source.modules);
  });
  //flating the array so that data can be obtained from one for loop less
  modules = modules.flat(1);
  //data array
  const dt = [];
  //for each module get the privielege from it and push it the dt array
  modules.forEach((el) => {
    el.priveleges.forEach((el) => dt.push(el));
  });
  //the main data array
  // let mainData = [];
  //loop fir all the modules
  for (let i = 0; i < modules.length; i++) {
    //specifiying the empty array for the modules data
    modules[i].data = [];
    //for all the privelegse loop throight it
    for (let j = 0; j < modules[i].priveleges.length; j++) {
      //push the data
      modules[i].data = [...modules[i].data, []];
      //for all the patterns in the priveleges loop through it
      for (let k = 0; k < modules[i].priveleges[j].pattern.length; k++) {
        // search for the game data by the pattern of the modules
        const a = await client.search({
          index: "games",
          body: {
            query: {
              query_string: {
                query: modules[i].priveleges[j].pattern[k].label,
              },
            },
          },
        });
        //push the data with the privielges
        modules[i].data[j].push({
          data: a,
          p: modules[i].priveleges[j].priveleges,
        });
      }
    }
  }
  //Return the modules array with the data and privieleges
  return modules;
};

//Search users
module.exports.searchUser = async function (request, h) {
  //Search the users by their username,email,firstname and lastname
  const result = await client.search({
    index: "users",
    body: {
      query: {
        query_string: {
          query: "*" + request.payload.searchTerm + "*",
          fields: ["username", "email", "firstName", "lastName"],
        },
      },
    },
  });
  //return the results
  return result.body.hits.hits;
};

//Create Admin
module.exports.CreateAdmin = async function (request, h) {
  //Hash the password
  const password = await bcrypt.hash(request.payload.password, 10);
  //Index the admin
  const result = await client.index({
    index: "users",
    body: {
      username: request.payload.username,
      firstName: request.payload.firstName,
      lastName: request.payload.lastName,
      email: request.payload.email,
      password,
      status: request.payload.status,
      type: "admin",
      roles: [],
    },
  });
  //return the message
  return { msg: "success" };
};

//Deletes the admin
//Only admin can be deleted from this request, user cannot be deleted
module.exports.deleteAdmin = async function (request, h) {
  //get the user
  let userData = await client
    .get({
      index: "users",
      id: request.payload.id,
    })
    .catch((err) => console.log(err));
  //
  userData = await userData.body._source;
  //check the type of the user
  //if it is user the send messgae
  if (userData.type === "user") {
    return { msg: "User cannot be deleted", status: 204 };
  } else {
    //else
    //deletes the admin by id sent in the request
    await client.delete({
      index: "users",
      type: "_doc",
      id: request.payload.id,
    });
    //refresh the users index
    await client.indices.refresh({ index: "users" });
    //get all the users
    const result = await client.search({
      index: "users",
      body: {
        query: {
          match_all: {},
        },
      },
    });
    //send the results
    return result.body.hits.hits;
  }
};

//Searches the userdata
module.exports.searchUserData = async (request, h) => {
  //get the token from the request
  const token = request.payload.token;
  //get the searchterm from the request
  const searchTerm = request.payload.searchTerm;
  //get the module from which the data has to be searched from the request
  const module = request.payload.module;
  //refresh the roles index
  await client.indices.refresh({ index: "roles" });
  //get all the roles from the index
  let result = client.search({
    index: "roles",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  let moduleData;
  const data = (await result).body.hits.hits;
  // for each role check for the module we need
  data.forEach((role, index) => {
    role._source.modules.forEach((module1, index2) => {
      if (module1.name === module) {
        //if found then store it's priveleges in the moduleData variable
        moduleData = module1.priveleges;
      }
    });
  });

  const mainData = [];
  //loops for all the privelges in the moduledata
  for (let i = 0; i < moduleData.length; i++) {
    //push the empty data array and privelges to the mainData array
    mainData.push({ data: [], p: moduleData[i].priveleges });
    for (let j = 0; j < moduleData[i].pattern.length; j++) {
      //for all the patterns search from the db
      const a = await client.search({
        index: "games",
        body: {
          query: {
            query_string: {
              query: moduleData[i].pattern[j].label,
            },
          },
        },
      });
      //push the data in the mainData array
      mainData[i].data.push(a);
    }
  }
  //Array for getting just the name and permission from the mainData array
  const mainData2 = [];
  mainData.forEach((datas, index) => {
    datas.data.forEach((datas1, index1) => {
      datas1.body.hits.hits.forEach((datas2, index2) => {
        if (datas2._source.name.includes(searchTerm)) {
          mainData2.push({ name: datas2._source.name, permission: datas.p });
        }
      });
    });
  });
  //Sends the searched data
  return mainData2;
};
