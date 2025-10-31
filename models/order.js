const sequelize = require("../utils/database");
const Sequelize = require("sequelize");
const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
    },
    status: {
    type: Sequelize.STRING,
    allowNull: true,
    },
});
   module.exports = Order;