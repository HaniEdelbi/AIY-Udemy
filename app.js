// ...existing code...
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const User = require("./models/user");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const fs = require("fs");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

// Set up multer for file uploads
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@udemyaiy.b3jjitl.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?appName=UdemyAIY`;
const app = express();
const store = new MongoDbStore({ uri: MONGODB_URI, collection: "sessions" });

console.log(process.env.NODE_ENV);

const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const safeDate = new Date().toISOString().replace(/:/g, "-");
    cb(null, safeDate + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

const adminRoutes = require("./routes/admin");
const login = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const user = require("./models/user");
const authRoutes = require("./routes/auth");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(login);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.getPNF);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
