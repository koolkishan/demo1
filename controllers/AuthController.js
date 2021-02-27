//Get the database connection
const client = require("../DBConnection");
//Get the bcrypt package for password encryption
const bcrypt = require("bcrypt");
//Get the jwt package for token management
const jwt = require("jsonwebtoken");

//Handles the login of the user
module.exports.login = async function (request, h) {
  //Get the email of the user from the request
  const email = request.payload.email;
  //Get the password of the user from the request
  const password = request.payload.password;
  //Get the user by email from the database
  const checkEmail = await client.search({
    index: "users",
    body: {
      query: {
        match_phrase: {
          email,
        },
      },
    },
  });
  //if the user is present in the result
  if (checkEmail.body.hits.total.value === 1) {
    //get the user id from the result
    const id = checkEmail.body.hits.hits[0]._id;
    //get the user data from the result
    const data = checkEmail.body.hits.hits[0]._source;
    // if the status of the user is active then only proceed next
    if (checkEmail.body.hits.hits[0]._source.status === "active") {
      //if the user is active
      //match the password hash from db
      const match = await bcrypt.compare(password, data.password);
      //if the password hash matches then only proceed
      if (match) {
        //if the password matched
        //Create jwt token with the user id in it.
        const token = jwt.sign({ id }, "aa");
        //return the token with the type of the user and the name of the user
        return {
          status: true,
          token,
          type: data.type,
          name: checkEmail.body.hits.hits[0]._source.username,
        };
      }
      //if the password hash dosen't matches
      else {
        return { status: false, msg: "Invalid Username or password" };
      }
    }
    // if the user status is not active
    else {
      return { status: false, msg: "User Status is not active" };
    }
  }
  // if there is no user with the email given
  return { status: false, msg: "Invalid Username or password" };
};

//Handles the authorization for the user
//Only the admin can accesss the admin area
module.exports.authorize = async function (request, h) {
  //get the token from the request
  const token = request.payload.token;
  //decode the id from the token
  const { id } = jwt.decode(token, "aa");
  //refresh the database
  await client.indices.refresh({ index: "users" });
  //get the user from the id
  let userData = await client
    .get({
      index: "users",
      id,
    })
    .catch((err) => console.log(err));
  // get the userdata from the result
  userData = await userData.body._source;
  //if the user type is not admin then send unauthorized status
  if (userData.type !== "admin") {
    return { msg: "Unauthorized", status: 401 };
  }
  // if the user type is admin then send ok
  else {
    return { status: 200 };
  }
};

//Authorize the user
//Only the user can access the user are
module.exports.authorizeUser = async function (request, h) {
  //get the token from the request
  const token = request.payload.token;
  //decode the id from the token
  const { id } = jwt.decode(token, "aa");
  //refresh the database
  await client.indices.refresh({ index: "users" });
  //get the user from the id
  let userData = await client
    .get({
      index: "users",
      id,
    })
    .catch((err) => console.log(err));
  userData = await userData.body._source;
  //if the user type is not admin then send unauthorized status
  if (userData.type !== "user") {
    return { msg: "Unauthorized", status: 401 };
  } // if the user type is admin then send ok
  else {
    return { status: 200 };
  }
};
