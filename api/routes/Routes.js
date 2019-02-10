'use strict';

module.exports = function(app) {
	var posts_controller = require('../controllers/Controllers.js');
	var login_controller = require('../controllers/loginController.js');

	app.route('/login/:userName')
		.get(login_controller.check_username)
		.post(login_controller.checkin_username)
		.delete(login_controller.checkout_username);

	app.route('/posts')
		.post(posts_controller.create_post)
		.get(posts_controller.get_all_posts);

	app.route('/posts/:postId')
		.get(posts_controller.get_post)
		.delete(posts_controller.delete_post);

	app.route('/posts/:postId/meta/comments')
		.post(posts_controller.comment_post)
		.delete(posts_controller.delete_comment);

	app.route('/posts/:postId/meta/likes')
		.post(posts_controller.likes_inc)
		.delete(posts_controller.likes_dec);

	app.route('/posts/:postId/meta/dislikes')
		.post(posts_controller.dislikes_inc)
		.delete(posts_controller.dislikes_dec);
}
