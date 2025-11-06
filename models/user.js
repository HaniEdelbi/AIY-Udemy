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
    // optional but recommended, helps avoid duplicates:
    // unique: true,
  },
  password: {
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

const { Types } = require("mongoose");
const { ObjectId } = Types;

userSchema.methods.addToCart = async function (product) {
  const userId = typeof this._id === "string" ? new ObjectId(this._id) : this._id;
  const prodId = typeof product._id === "string" ? new ObjectId(product._id) : product._id;

  const User = this.constructor; // the Mongoose model for this document

  // 1) Try to increment an existing cart item
  const incResult = await User.updateOne(
    { _id: userId, "cart.items.productId": prodId },
    { $inc: { "cart.items.$.quantity": 1 } }
  );

  if (incResult.modifiedCount > 0) {
    // Return the updated doc (parity with this.save())
    return User.findById(userId, "cart").lean();
  }

  // 2) Otherwise push a new cart item
  await User.updateOne(
    { _id: userId },
    { $push: { "cart.items": { productId: prodId, quantity: 1 } } }
  );

  // Return the updated doc
  return User.findById(userId, "cart").lean();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
