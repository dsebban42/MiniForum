'use strict';


var mongoose = require('mongoose'),
  Post = mongoose.model('Post');

this.save = (model, res) => {
	model.save((err, post) => {
		if (err)
		{
			res.send(err);
			return ;
		}
		res.json({ saved : true });
	});
};

exports.create_post = (req, res) => {
	var new_post = new Post(req.body);
	this.save(new_post, res);
};

exports.get_all_posts = (req, res) => {
	console.log('get_all_posts');
	Post.find({}, (err, post) => {
		console.log(post);
		console.log(err);
		if (err)
		{
			res.send(err);
			return ;
		}
		res.json(post)
	});
};

exports.get_post = (req, res) => {
	Post.findById(req.params.postId, (err, post) => {
		if (err)
			return res.send(err);
		res.json(post);
	});
};

exports.delete_post = (req, res) => {
	Post.findByIdAndRemove(req.params.postId, (err, post) => {
		if (err)
			res.send(err);
		if (!post)
			res.json({delete : false, empty : true});
		else
			res.json({delete : true, empty : false});
	});
};

exports.comment_post = (req, res) => {
	Post.findById(req.params.postId, (err, post) => {
		if (!post)
		{
			res.json([]);
			return ;
		}
		if (err)
		{
			res.send(err);
			return ;
		}
		post.meta.comments.push({ content : req.body.content, author : req.body.author });
		this.save(post, res);
	});
};

exports.delete_comment = (req, res) => {
};

exports.likes_inc = (req, res) => {
	Post.findById(req.params.postId, (err, post) => {
		if (err)
		{
			res.send(err);
			return ;
		}
		post.meta.like++;
		this.save(post, res);
	});
};

exports.likes_dec = (req, res) => {
	Post.findById(req.params.postId, (err, post) => {
		if (err)
			res.send(err);
		if (post.meta.like <= 0)
			return res.json(post);
		post.meta.like--;
		this.save(post, res);
	});
};

exports.dislikes_inc = (req, res) => {
	Post.findById(req.params.postId, (err, post) => {
		if (err)
			res.send(err);
		post.meta.dislike++;
		this.save(post, res);
	});
};

exports.dislikes_dec = (req, res) => {
	Post.findById(req.params.postId, (err, post) => {
		if (err)
			res.send(err);
		if (post.meta.like <= 0)
			return res.json(post);
		post.meta.dislike--;
		this.save(post, res);
	});
};
