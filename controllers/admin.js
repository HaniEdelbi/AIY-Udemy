const Product = require("../models/product");
const mongoose = require("mongoose");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title && req.body.title.trim();
  const imageURL = req.body.imageURL && req.body.imageURL.trim();
  const price = req.body.price;
  const description = req.body.description && req.body.description.trim();
  if (!title || !imageURL || !price || !description || isNaN(price)) {
    req.flash("error", "Please provide valid product details.");
    return res.redirect("/admin/add-product");
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageURL: imageURL,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Failed to create product.");
      res.redirect("/admin/add-product");
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title && req.body.title.trim();
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageURL && req.body.imageURL.trim();
  const updatedDesc = req.body.description && req.body.description.trim();

  if (!updatedTitle || !updatedImageUrl || !updatedPrice || !updatedDesc || isNaN(updatedPrice)) {
    req.flash("error", "Please provide valid product details.");
    return res.redirect(`/admin/edit-product/${prodId}?edit=true`);
  }

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/admin/products");
      }
      if (product.userId.toString() !== req.user._id.toString()) {
        req.flash("error", "Not authorized to edit this product.");
        return res.redirect("/admin/products");
      }
      product.title = updatedTitle;
      product.imageURL = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save();
    })
    .then((result) => {
      if (!result) return; // already redirected
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Failed to update product.");
      res.redirect(`/admin/edit-product/${prodId}?edit=true`);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .populate("userId")
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        req.flash("error", "Product not found.");
        return res.redirect("/admin/products");
      }
      if (product.userId.toString() !== req.user._id.toString()) {
        req.flash("error", "Not authorized to delete this product.");
        return res.redirect("/admin/products");
      }
      return Product.findByIdAndDelete(prodId).then(() => {
        console.log("DESTROYED PRODUCT");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => console.log(err));
};
