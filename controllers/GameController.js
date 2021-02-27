//Get the Database Connection
const client = require("../DBConnection");

//Get all the Games from the database
module.exports.getAllGames = async function (request, h) {
  //Refresh the database
  await client.indices.refresh({ index: "games" });
  //Get all the games from the database
  const result = await client.search({
    index: "games",
    body: {
      query: {
        match_all: {},
      },
    },
  });
  //send all the games
  return result.body.hits.hits;
};

//Insert the gamesdata to the database
module.exports.insertGameData = async function (request, h) {
  //Variable to have the games
  const games = [
    { name: "Assassins Creed" },
    { name: "Prince of persia" },
    { name: "hitman" },
    { name: "Grand Theft Auto" },
    { name: "Minecraft" },
    { name: "Counter Strike" },
    { name: "Chicken Invaders" },
    { name: "Ultimate Ninja Storm" },
    { name: "Dragonball Xenoverse" },
    { name: "Bodukai Tenkachi" },
    { name: "Mystery Legends" },
    { name: "Farm Frenzy" },
    { name: "Among US" },
    { name: "PUBG" },
    { name: "Call of Duty" },
    { name: "Witcher" },
    { name: "Farm Frenzy" },
    { name: "Overwatch" },
    { name: "Forza Horizen" },
    { name: "The Crew" },
    { name: "Need for speed" },
    { name: "Cyberpunk" },
    { name: "Pokemon GO" },
    { name: "Sanandreas" },
    { name: "Doom" },
    { name: "Clash of clans" },
    { name: "Halo" },
    { name: "Far cry" },
    { name: "Tom Clancy" },
    { name: "Apex Legends" },
    { name: "League of legends" },
    { name: "Ben 10" },
    { name: "Candy Crush Saga" },
    { name: "Teris" },
    { name: "Farmville" },
    { name: "City Ville" },
  ];
  //Creating the body array for all the games by flatMap method
  const body = games.flatMap((doc) => [{ index: { _index: "games" } }, doc]);
  //Add the Nulk data by by bulk method of elastic search
  const { body: bulkResponse } = await client.bulk({
    refresh: true,
    body,
  });
  //Return the added data
  return body;
};
