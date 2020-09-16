var express = require('express');
const bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

  
var routes = require('./routing.js');

app.set('view engine', 'pug');
app.set('views','./views');

app.use('/js', express.static(__dirname + '/node_modules/axios/dist')); // redirect axios js
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/bootstrap-toggle/js')); // redirect bootstrap-toggle JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/node_modules/bootstrap-toggle/css')); // redirect CSS bootstrap-toggle
app.use('/scripts', express.static('scripts'));
app.use('/', routes);

app.listen(3000);