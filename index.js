require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const admin = require('./Routes/Admin/adminRoute');
const superAdmin = require('./Routes/Admin/superAdminRoute');
const user = require('./Routes/User/userRoute');
const public = require('./Routes/publicRoute');

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

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/courseFile', express.static('./Resources/Course'));
app.use('/lessonFile', express.static('./Resources/Lesson'));
app.use('/masterFile', express.static('./Resources/Master'));

app.use("/api/admin", admin);
app.use("/api/superAdmin", superAdmin);
app.use("/api/user", user);
app.use("/api", public);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});