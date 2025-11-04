const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});
module.exports = mongoose.model("User", userSchema);
// const mongodb = require("mongodb");

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     const db = getDb();

//     const userId =
//       typeof this._id === "string" ? new ObjectId(this._id) : this._id;
//     const prodId =
//       typeof product._id === "string" ? new ObjectId(product._id) : product._id;

//     // 1) Try to increment existing cart item
//     const inc = db
//       .collection("users")
//       .updateOne(
//         { _id: userId, "cart.items.productId": prodId },
//         { $inc: { "cart.items.$.quantity": 1 } }
//       );

//     // If a matching item was found and incremented, we're done
//     if (inc.matchedCount > 0) return inc;

//     // 2) Otherwise push a new cart item
//     const push = db
//       .collection("users")
//       .updateOne(
//         { _id: userId },
//         { $push: { "cart.items": { productId: prodId, quantity: 1 } } }
//       );

//     return push;
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: { ObjectId: userId } })
//       .then((user) => {
//         console.log(user);
//         return user;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = User;
