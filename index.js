const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const PORT = 8080;

const db = require('./models');
db.sequelize.sync()
.then(() => {
    //console.log('Database is synced');
})
.catch((err) => {
    //console.log(err);
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

require('./routes/route.js')(app);
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}.`);
});