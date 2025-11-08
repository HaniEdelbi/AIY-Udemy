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
  let imageURL = req.file ? req.file.path : "";
  // Store only the path relative to 'public' and use forward slashes
  if (imageURL.startsWith('public/') || imageURL.startsWith('public\\')) {
    imageURL = imageURL.replace(/^public[\\/]/, '');
  }
  imageURL = imageURL.replace(/\\/g, '/');
  const price = req.body.price;
  const description = req.body.description && req.body.description.trim();
  if (!imageURL) {
    req.flash("error", "Please provide a valid image file.");
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
      product: {
        title: title || "",
        price: price || "",
        description: description || ""
        // imageURL intentionally omitted
      },
      errorMessage: "Please provide a valid image file."
    });
  }

  console.log("Received image file:", imageURL);
  if (!title || !imageURL || !price || !description || isNaN(price)) {
    req.flash("error", "Please provide valid product details.");
    return res.render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      csrfToken: req.csrfToken(),
      product: {
        title: title || "",
        price: price || "",
        description: description || ""
        // imageURL intentionally omitted
      },
      errorMessage: "Please provide valid product details."
    });
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
      console.log("Created Product");
      console.log("Final imageURL in DB:", result.imageURL);
      const fs = require('fs');
      const imagePath = require('path').join(__dirname, '../public', result.imageURL);
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log("Image file does NOT exist on disk:", imagePath);
        } else {
          console.log("Image file exists on disk:", imagePath);
        }
        res.redirect("/admin/products");
      });
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
  console.log("Edit pressed for product id:", prodId);
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
  console.log("--- POST /admin/edit-product route hit ---");
  const prodId = req.body.productId;
  const updatedTitle = req.body.title && req.body.title.trim();
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description && req.body.description.trim();
  console.log("Form values:", { prodId, updatedTitle, updatedPrice, updatedDesc });
  let newImage = req.file ? req.file.path : null;
  console.log("req.file:", req.file);
  if (newImage && (newImage.startsWith('public/') || newImage.startsWith('public\\'))) {
    newImage = newImage.replace(/^public[\\/]/, '');
  }
  if (newImage) {
    newImage = newImage.replace(/\\/g, '/');
  }
  console.log("newImage (relative):", newImage);
  const updatedImageUrl =
    newImage || (req.body.imageURL && req.body.imageURL.trim());
  console.log("updatedImageUrl:", updatedImageUrl);

  if (
    !updatedTitle ||
    !updatedImageUrl ||
    !updatedPrice ||
    !updatedDesc ||
    isNaN(updatedPrice)
  ) {
    console.log("Validation failed", { updatedTitle, updatedImageUrl, updatedPrice, updatedDesc });
    req.flash("error", "Please provide valid product details.");
    return res.redirect(`/admin/edit-product/${prodId}?edit=true`);
  }

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        console.log("Product not found");
        req.flash("error", "Product not found.");
        return res.redirect("/admin/products");
      }
      if (product.userId.toString() !== req.user._id.toString()) {
        console.log("Not authorized to edit this product");
        req.flash("error", "Not authorized to edit this product.");
        return res.redirect("/admin/products");
      }
      product.title = updatedTitle;
      if (newImage) {
        product.imageURL = newImage;
        console.log("Image updated:", newImage);
      } else {
        product.imageURL = updatedImageUrl;
        console.log("Image not updated, using:", updatedImageUrl);
      }
      product.price = updatedPrice;
      product.description = updatedDesc;
      console.log("Saving product:", product);
      return product.save();
    })
    .then((result) => {
      if (!result) return; // already redirected
      console.log("Product updated successfully");
      console.log("Final imageURL in DB:", result.imageURL);
      const fs = require('fs');
      const imagePath = require('path').join(__dirname, '../public', result.imageURL);
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log("Image file does NOT exist on disk:", imagePath);
        } else {
          console.log("Image file exists on disk:", imagePath);
        }
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.log("Error in product update:", err);
      req.flash("error", "Failed to update product.");
      res.redirect(`/admin/edit-product/${prodId}?edit=true`);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .populate("userId")
    .then((products) => {
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
