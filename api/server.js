var express = require('express'),
	cors = require('cors'),
	app = express(),
	port = process.env.PORT || 8080;
	mongoose = require('mongoose'),
	Post = require('./models/PostModel.js'),
	Login = require('./models/LoginModel.js'),
	bodyParser = require('body-parser');

	mongoose.Promise = global.Promise;
	mongoose.connect('mongodb://192.168.1.12/PostsDb');

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(cors());
	// app.use((req, res) => {
	// 	res.status(404).send({url: req.originalUrl + 'not found'})
	// });
	var routes = require('./routes/Routes');
	routes(app);

app.listen(port, "0.0.0.0");

console.log(`todo list RESTfull API server started on: ${port}`);
