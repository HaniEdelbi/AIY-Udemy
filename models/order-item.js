const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const orderItem = sequelize.define("orderItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  quantity: Sequelize.INTEGER,
});
module.exports = orderItem;
