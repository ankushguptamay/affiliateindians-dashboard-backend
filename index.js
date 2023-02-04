require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();

var corsOptions = {
    origin: "*",
  };

const db = require('./Models');
db.sequelize.sync()
.then(() => {
    console.log('Database is synced');
})
.catch((err) => {
    console.log(err);
});

app.use(cors(corsOptions));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.use("/admin", require("./Routes/Admin/authAdmin"));
app.use("/admin/auth", require("./Routes/Admin/adminRoute"));
// app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});