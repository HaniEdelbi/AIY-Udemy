const getDb = require("../utils/database").getDb;
const mongodb = require("mongodb");
class Product {
  constructor(Title, imageURL, description, price, id, userId) {
    this.title = Title;
    this.imageURL = imageURL;
    this.description = description;
    this.price = price;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }
  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({
        _id: new mongodb.ObjectId(prodId),
      })
      .then((result) => {
        console.log("Deleted");
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Product;

// Removed Sequelize model definition as per recent edits
// const Product = sequelize.define("product", {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true,
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false,
//   },
//   imageURL: {
//     type: Sequelize.STRING(2048),
//     allowNull: false,
//   },
//   description: {
//     type: Sequelize.TEXT,
//     allowNull: false,
//   },
// });

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
