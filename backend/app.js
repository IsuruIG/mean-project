const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

const header1 = 'Access-Control-Allow-Origin';
const header2 = 'Access-Control-Allow-Headers';
const header3 = 'Access-Control-Allow-Methods';

const mongooseRootPassword = "s9LCKg545i3tlcDo"; // Password: s9LCKg545i3tlcDo
const mongooseDb = "node_module";

const mongooseUrl = "mongodb+srv://Isuru:" + mongooseRootPassword + "@cluster0.cfpk7.mongodb.net/" + mongooseDb + "?retryWrites=true&w=majority";

const app = express();

mongoose.connect(mongooseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // - For URL passing.
app. use("/images", express.static(path.join("backend/images")));


app.use((req, res, next) => {
  res.setHeader(header1, '*'); // * - Allows from any domains the client/s runs.
  res.setHeader(header2, 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Allows the mentioned domains to access the server.
  res.setHeader(header3, 'GET, POST, PATCH, PUT, DELETE, OPTIONS'); // Allows the mentioned HTTP methods to access the server.
  next();
});

app.use("/posts", postsRoutes);
app.use("/user", userRoutes);

module.exports = app;
