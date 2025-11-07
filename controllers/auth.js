// Render the new password form
exports.getNewPassword = (req, res, next) => {
  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "Set New Password",
    isAuthenticated: false,
    errorMessage: req.flash("error")[0],
    successMessage: req.flash("success")[0],
    csrfToken: req.csrfToken(),
  });
};
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login Page",
    isAuthenticated: false,
    errorMessage: req.flash("error")[0],
    csrfToken: req.csrfToken(),
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          req.flash("error", "Invalid email or password.");
          return res.redirect("/login");
        }
        req.session.isLoggedIn = true;
        req.session.user = user._id;
        req.session.save((err) => {
          if (err) console.log(err);
          res.redirect("/");
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn || false,
    errorMessage: req.flash("error")[0] || null,
    oldInput: {},
    csrfToken: req.csrfToken(),
  });
};

exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: "Passwords do not match.",
      oldInput: { name, email },
      csrfToken: req.csrfToken(),
    });
  }
  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        req.flash("error", "Email already in use.");
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          name,
          email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save();
      });
    })
    .then((user) => {
      if (!user) return;
      req.session.isLoggedIn = true;
      req.session.user = user._id;
      req.session.save(() => {
        res.redirect("/login");
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/signup");
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  console.log('[RESET PAGE] /reset GET loaded');
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    isAuthenticated: false,
    errorMessage: req.flash("error")[0] || null,
    successMessage: req.flash("success")[0] || null,
    csrfToken: req.csrfToken(),
  });
};

// Basic postReset handler for password reset form submission

const crypto = require("crypto");

exports.postReset = (req, res, next) => {
  console.log('[RESET PAGE] /reset POST (reset button pressed)');
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    console.log('[RESET PAGE] Email or newPassword not provided');
    req.flash("error", "Please enter your email and a new password.");
    return res.redirect("/reset");
  }
  User.findOne({ email: email }).then(user => {
    if (!user) {
      console.log('[RESET PAGE] No user found with email:', email);
      req.flash("error", "No account found with that email address.");
      return res.redirect("/reset");
    }
    return bcrypt.hash(newPassword, 12).then((hashedPassword) => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save().then(() => {
        console.log('[RESET PAGE] Password updated for user:', user._id);
        req.flash("success", "Password updated successfully. You can now log in.");
        res.redirect("/login");
      });
    });
  }).catch((err) => {
    console.log('[RESET PAGE] Error updating password:', err);
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/reset");
  });
};

// Properly exported as a top-level function
exports.postNewPassword = (req, res, next) => {
  const { newPassword } = req.body;
  console.log('[NEW PASSWORD] POST /new-password called');
  console.log('  newPassword:', newPassword);
  if (!newPassword) {
    console.log('[NEW PASSWORD] No newPassword provided');
    req.flash("error", "Invalid request.");
    return res.redirect("/reset");
  }
  User.findOne().then(user => {
    if (!user) {
      console.log("[NEW PASSWORD] No users found in the database.");
      req.flash("error", "No users found in the database.");
      return res.redirect("/reset");
    }
    console.log('[NEW PASSWORD] Found user:', user._id, user.email);
    return bcrypt.hash(newPassword, 12).then((hashedPassword) => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      return user.save().then(() => {
        console.log("[NEW PASSWORD] Password updated for user:", user._id);
        req.flash("success", "Password updated successfully. You can now log in.");
        res.redirect("/login");
      });
    });
  }).catch((err) => {
    console.log("[NEW PASSWORD] ERROR", err);
    req.flash("error", "An error occurred. Please try again.");
    res.redirect("/reset");
  });
};
