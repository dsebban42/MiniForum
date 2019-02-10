var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginSchema = new Schema({
	userName:		{type:	String, required: "userName required"},
	isLogged:		{ type:	Boolean, default: false }
});

module.exports = mongoose.model('Login', loginSchema);
