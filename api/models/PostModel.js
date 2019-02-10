var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema = new Schema({
	title: 			{ type: String, required: "Please add a title" },
	author: 		{ type: String, required: "Error Author not found" },
	content:		{ type: String, required: "You must write a content" },
	date: 			{ type: Date, default: Date.now },
	meta: {
		comments:					[{ content: String, author: String }],
		like: 		{ type: Number, default : 0 },
		dislike:	{ type: Number, default : 0 }
	}
});
module.exports = mongoose.model('Post', postsSchema);
