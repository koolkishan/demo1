//Require the database connection
const client = require("../DBConnection");

//Get specific role by id
module.exports.getRole = async function (request, h) {
  //Refresh the role index
  await client.indices.refresh({ index: "roles" });
  //get the role from db by role id
  const result = await client
    .get({
      index: "roles",
      id: request.params.id,
    })
    .catch((err) => console.log(err));
  //return the found role
  return result.body._source;
};

//Update the data of the role
module.exports.updateRole = async function (request, h) {
  //Update the role by indexing the roles by sending the role id
  await client
    .index({
      index: "roles",
      id: request.payload.id,
      body: {
        name: request.payload.name,
        description: request.payload.description,
        modules: request.payload.modules,
      },
    })
    .catch((err) => {
      console.log(err.meta);
      return err;
    });

  //Return message
  return { msg: "success" };
};

//Get all the roles for creating a new user
module.exports.getRolesForUserCreate = async function (request, h) {
  //Refresh the roles index
  await client.indices.refresh({ index: "roles" });
  //Search for all roles by match_all
  let result = client.search({
    index: "roles",
    body: {
      query: {
        match_all: {},
      },
    },
  });

  //return all the roles
  return (await result).body.hits.hits;
};

//Adds new Roles
module.exports.addRoles = async function (request, h) {
  //add the new role to the roles index.
  //Gets the data from the request
  const result = await client.index({
    index: "roles",
    body: {
      name: request.payload.name,
      description: request.payload.description,
      modules: request.payload.modules,
      users: [],
    },
  });
  //Return the newly created role
  return result;
};

//Gets all the roles from the database
module.exports.getRoles = async function (request, h) {
  //Refresh the index
  await client.indices.refresh({ index: "roles" });
  //Gets all roles from the index
  const result = await client.search({
    index: "roles",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  result.body.hits.hits.forEach((role) => {
    console.log(role._source);
  });

  return result.body.hits.hits;
};

//Deletes the Roles
module.exports.deleteRole = async function (request, h) {
  //get the role
  const result = await client
    .get({
      index: "roles",
      id: request.payload.id,
    })
    .catch((err) => console.log(err));
  const users = result.body._source.users;
  console.log(users);
  //for the users array
  for (let i = 0; i < users.length; i++) {
    await client.indices.refresh({ index: "users" });
    //Get the user by sending the id in the request
    const user = await client
      .get({
        index: "users",
        id: users[i],
      })
      .catch((err) => console.log(err));
    console.log(user.body._source.roles);
    console.log(request.payload.id);
    const index = user.body._source.roles.findIndex(
      (ele) => ele.id === request.payload.id
    );
    user.body._source.roles.splice(index, 1);
    await client
      .index({
        index: "users",
        id: user.body._id,
        body: user.body._source,
      })
      .catch((err) => {
        console.log(err.meta);
        return err;
      });
  }
  //for each user id
  //fetch the user
  //remove the roles from the roles array
  //roles array has id and label object
  //compare it with the current role id
  //if match then splice and break the loop
  //save the user
  //delete the role

  //Deletes the role from the role index by speicifying the role id
  const role = await client.delete({
    index: "roles",
    type: "_doc",
    id: request.payload.id,
  });
  console.log(role);
  //refresht the role index
  await client.indices.refresh({ index: "roles" });
  //get all the roles after deletion and send it to the user
  const result1 = await client.search({
    index: "roles",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  //sends all the roles
  return result1.body.hits.hits;
};

//Search roles from the index
module.exports.searchRole = async function (request, h) {
  //Search for the role by searchterm
  const result = await client.search({
    index: "roles",
    body: {
      query: {
        wildcard: {
          name: {
            value: "*" + request.payload.searchTerm + "*",
          },
        },
      },
    },
  });
  //sends the found roles
  return result.body.hits.hits;
};
