const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  // const isLoggedIn = req.get("Cookie").split("=")[1]?.trim();
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login Page",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(401).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          isAuthenticated: false,
          errorMessage: "Invalid email or password.",
        });
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          return res.status(401).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            isAuthenticated: false,
            errorMessage: "Invalid email or password.",
          });
        }
        req.session.isLoggedIn = true;
        req.session.user = user._id;
        req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: req.session.isLoggedIn || false,
    errorMessage: null,
    oldInput: {},
  });
};

// POST /signup
exports.postSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // super minimal; you can add real validation + hashing later
  if (password !== confirmPassword) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: "Passwords do not match.",
      oldInput: { name, email },
    });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(422).render("auth/signup", {
          path: "/signup",
          pageTitle: "Signup",
          isAuthenticated: false,
          errorMessage: "Email already in use.",
          oldInput: { name, email },
        });
      }

      // Hash the password before saving
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
      if (!user) return; // already responded above on duplicate
      // auto-login after signup (optional)
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
