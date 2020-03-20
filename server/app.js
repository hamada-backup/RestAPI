const express = require("express");
const path = require("path");

const cookieParser = require("cookie-parser");
// const flash = require("express-flash-messages");
const flash = require("express-flash");
const session = require("express-session");

const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const hbs = require("express-hbs");
const cors = require("cors");
const moment = require("moment");

const indexRouter = require("./routes/index");
//// mySql router  ////
const apiRouter = require("./routes/api");
//// Atlas router ////
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const clientRouter = require("./routes/client");

//// Admin
const adminRouter = require("./routes/admin");
//// the App ////
const app = express();

// Moment
//console.log(moment());

//// MySql Connection ////
require("./mySqlDB").connect(err => {
  if (err) {
    throw err;
  }
  console.log("Connect to MySql");
});

// db.query(
//   "select products.*, order_ord_prod.*, orders.* from order_ord_prod inner join products on order_ord_prod.fk_product = products.id inner join orders on order_ord_prod.fk_orders = orders.id where products.id ",
//   (err, rows) => {
//     console.log(err);
//     console.table(rows);
//   }
// );

//// mongoAtlas Connection ////
require("./mongoDB");
mongoose.Promise = global.Promise;

//// Views Handlebar ////
app.use(logger("dev"));
app.engine(
  "hbs",
  hbs.express4({
    defaultLayout: __dirname + "/views/layouts/layout",
    partialsDir: __dirname + "/views/partials",
    layoutsDir: __dirname + "/views/layouts"
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "hbs");

//// Parsing Data ////
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//app.use("/images", express.static("images"));

app.use(
  session({
    secret: "This is my logng string for sessions http",
    resave: false,
    saveUninitialized: true
  })
);
app.use(flash());

//// CORS & Headers ////
app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authoritation"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT,PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

//// Router ////
app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/client", clientRouter);
app.use("/admin", adminRouter);

//// Catch Errors Server (General) ////
app.use((req, res, next) => {
  const error = new Error("Not Found, I creat this message");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: error.message
  });
});
module.exports = app;
