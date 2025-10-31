const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imageURL: {
    type: Sequelize.STRING(2048),
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

module.exports = Product;

// Removed the entire content of this file as per recent edits for ORM

// const db = require("../utils/database");
// const Cart = require("./cart");

// module.exports = class Product {
//   constructor(Title, imageURL, description, price, id) {
//     this.title = Title;
//     this.imageURL = imageURL;
//     this.description = description;
//     this.price = price;
//     this.id = id;
//   }

//   save() {
//     return db.execute(
//       "INSERT INTO products (title, imageURL, price,  description) VALUES (?,?,?,?)",
//       [this.title, this.imageURL, this.price, this.description]
//     );
//   }

//   static deleteById(id) {}

//   static fetchAll() {
//     return db.execute("SELECT * FROM products");
//   }

//   static findByPk(id) {
//     return db.execute("SELECT * FROM products WHERE products.id = ?", [id]);
//   }
// };
