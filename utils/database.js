const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://HaniEdelbi:hani54321@udemyaiy.b3jjitl.mongodb.net/?appName=UdemyAIY"
  )
    .then((client) => {
      _db = client.db();
      console.log("Connected to MongoDB");
      callback(client);
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

module.exports = mongoConnect;
module.exports.getDb = getDb;
//This was used for Sequelize ORM connection before switching to MongoDB
// const Sequelize = require("sequelize");
// const sequelize = new Sequelize("udemydb", "root", "hani54321", {
//   dialect: "mysql",
//   host: "localhost",
// });
// module.exports = sequelize;

//This was used for MySQL database connection before switching to Sequelize ORM
// const mysql = require("mysql2");
// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "udemydb",
//   password: "hani54321",
// });
// module.exports = pool.promise();
