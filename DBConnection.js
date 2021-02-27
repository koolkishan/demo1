//This file handles the database connection.

//Database is used elasticSearch

const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  node:
    "https://dpll67jqs4:fj1u60rf41@react-node-rapidops-9509018390.us-east-1.bonsaisearch.net:443",
});

//Exporting the database connection to make it reusable
module.exports = client;
