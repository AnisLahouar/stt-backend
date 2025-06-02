const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const app = express();
const isProduction = process.env.NODE_ENV == "production";



console.log("isProduction", process.env.NODE_ENV);


const corsOptions = {
  origin: "*",
  credentials: false,
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  allowedHeaders: 'Authorization, Content-Type, Accept',
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json(
  { limit: "50mb" }
));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("./app/uploads"));
app.use(routes);

module.exports = app;
