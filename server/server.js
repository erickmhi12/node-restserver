require('./config/config');


const mongoose = require('mongoose');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

//parser apllicaction/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//oarse application/json
app.use(bodyParser.json())

//app.use(require('./routes/usuario'));
//app.use(require('./routes/login'));

//Configuracion Global de Rutas

app.use(require('./routes/index'));


mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;

    console.log('Base de Datos ONLINE');
});


app.listen(process.env.PORT, () => {
    console.log(`scuchando el puerto ${process.env.PORT}`);
});