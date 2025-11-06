
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const User = require("./models/user");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://HaniEdelbi:hani54321@udemyaiy.b3jjitl.mongodb.net/?appName=UdemyAIY";
const app = express();
const store = new MongoDbStore({ uri: MONGODB_URI, collection: "sessions" });

const adminRoutes = require("./routes/admin");
const login = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const user = require("./models/user");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// app.use((req, res, next) => {
//   User.findById("690a115f1ef54a6cf1ba4e93")
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));
// });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(login);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.getPNF);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
