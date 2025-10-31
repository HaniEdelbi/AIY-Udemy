const Sequelize = require("sequelize");
const sequelize = new Sequelize("udemydb", "root", "hani54321", {
  dialect: "mysql",
  host: "localhost",
});
module.exports = sequelize;

//This was used for MySQL database connection before switching to Sequelize ORM

// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "udemydb",
//   password: "hani54321",
// });
// module.exports = pool.promise();
