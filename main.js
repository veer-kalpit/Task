require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const multer = require("multer");

const upload = multer();

const app = express();
const PORT = process.env.PORT || 4000;

// database
mongoose.connect(process.env.DB_URI, {});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the Database"));

// Middlewares
// for parsing application/json
app.use(express.json());

// for parsing application/xwww-
app.use(express.urlencoded({ extended: true }));
//form-urlencoded

// for parsing multipart/form-data
// app.use(upload.array());
app.use(express.static("public"));

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

// set template engine
app.set("view engine", "ejs");

// Route prefix
const routes = require("./routes/routes");
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
