'use strict';


var mongoose = require('mongoose'),
  Login = mongoose.model('Login');

this.create_user = (params, res) => {
	var new_user = new Login(params);
	new_user.save((err, user) => {
		if (err)
			return res.send(err);
			res.json({ user: user });
			new_user.isLogged = true;
			new_user.save();
	});
};

exports.check_username = (req, res) => {
	Login.find({ userName: req.params.userName }, (err, user) => {
		if (err)
		{
			return res.send(err);
		}
		if (!user.length)
			return res.json({ user: null });
			if (err)
				return res.send(err);
			return res.json({ user: user });
	});
}


exports.checkin_username = (req, res) => {
	Login.find({ userName: req.params.userName }, (err, user) => {
		if (err)
		{
			return res.send(err);
		}
		if (!user.length)
			return this.create_user(req.params, res);
		user[0].save((err, user) => {
			if (err)
				return res.send(err);
			res.json({ user: user });
			user.isLogged = true;
			user.save();
		});
	});
}

exports.checkout_username = (req, res) => {
	Login.find({ userName: req.params.userName }, (err, user) => {
		if (err)
		{
			return res.send(err);
		}
		if (!user.length)
			return res.send(user);
		user[0].isLogged = false;
		user[0].save((err, user) => {
			if (err)
				return res.send(err);
			res.json({ user: user });
		});
	});
}
