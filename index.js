require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const admin = require('./Routes/Admin/adminRoute');
const superAdmin = require('./Routes/Admin/superAdminRoute');
const user = require('./Routes/User/userRoute');

const app = express();

var corsOptions = {
  origin: "*",
};

const db = require('./Models');
db.sequelize.sync({ force: true })
  .then(() => {
    console.log('Database is synced');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static(__dirname + "/public"));

app.use("/api/admin", admin);
app.use("/api/superAdmin", superAdmin);
app.use("/api/user", user);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});