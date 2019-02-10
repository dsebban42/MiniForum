import React, { Component } from 'react';
import { Col, FormGroup, FormControl,
				 ButtonGroup, Well, Collapse,
				 Button, Glyphicon, Popover, Overlay,
			   Alert}
			   from 'react-bootstrap';
import './App.css';

var EventDispatcher = {
	_events: [],
 	addCallback (scope, sender, event, callback) {
		this._events.push(
			{
				sender:		sender,
				event:		event,
				callback:	callback,
				scope:		scope
			});
	},
	removeCallback (sender, event) {
		for (var curr, i = 0; i < this._events.length; i++)
		{
			curr = this._events[i];
			if (curr.event === event && sender === curr.sender)
			{
				this._events.splice(i, 1);
			}
		}
	},
	sendEvent (sender, event, content) {
		for (var curr, i = 0; i < this._events.length; i++)
		{
			curr = this._events[i];
			if (curr.event === event && sender === curr.sender)
			{
				curr.callback.call(curr.scope, curr.sender, curr.event, content);
			}
		}
	},
};

class Post extends Component {
	constructor(props) {
		super(props);
		this.handler = this.handler.bind(this);
		this.loginState = this.props.loginState;
		this.state = {
			error: null,
			isLoaded: false,
			items: []
		};
		console.log(EventDispatcher);
		EventDispatcher.addCallback(this, LogEngine, "UserChanged", this.fake);
	}

	fake(sender, event, content) {

		console.log(sender);
		console.log(event);
		console.log(content);
		console.log("hello i am connected");
	}

	handler() {
		this.getPosts();
	}

	thumbsUp(post) {
		if (!this.loginState.user._isLogged)
			return;
		post.meta.like++;
		this.updatePost(post, 'likes');
	}

	thumbsDown(post) {
		if (!this.loginState.user._isLogged)
			return;
		post.meta.dislike++;
		this.updatePost(post, 'dislikes');
	}

	updatePost(post, type) {
		var data = {
			postId: post._id,
			user: this.loginState.user._userName
		};
		fetch(`http://localhost:8080/posts/${post._id}/meta/${type}`, {
				method: "POST",
				body:		JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
		}).then(res => res.json())
		.then((response) => {
			console.log('Success: ', JSON.stringify(response));
			console.log(this.loginState.user);
			this.setState({isLoaded : true});
		})
		.catch(error => console.error('Error:', error));
	}

	getPosts () {
		fetch("http://localhost:8080/posts")
			.then(res => res.json())
			.then(
				(res) => {
					this.setState({
						isLoaded:	true,
						items:		res,
						error:		null,
					});
				},
				(err) => {
					this.setState({
						isLoaded: true,
						error : err,
					});
			});
	}
	componentDidMount() {
		this.getPosts();
	}

  render() {
		const {error, isLoaded, items} = this.state;
		if (isLoaded && !error)
		{
			var content = items.map((post) =>
				<div key={post._id} className="postContainer">
					<h3>{post.title}</h3>
					<p className="leftInfos">by {post.author} at: {post.date}</p>
					<p className="postContent">{post.content}</p>
					<div className="metaContainer">
				    <ButtonGroup>
							<div className="flex-column meta-buttons">
								<p>{post.meta.like}</p>
						    <Button onClick={this.thumbsUp.bind(this, post)}>
						    	<Glyphicon glyph="thumbs-up" />
						    </Button>
							</div>
							<div className="flex-column meta-buttons">
								<p>{post.meta.dislike}</p>
				      <Button onClick={this.thumbsDown.bind(this, post)}>
				        	<Glyphicon glyph="thumbs-down" />
				      </Button>
						</div>
				    </ButtonGroup>
						<Comment id={post._id} comments={post.meta.comments} loginState={this.props.loginState}/>
					</div>
				</div>
			);
			console.log(content);
    	return (
				<div className="gblContainer">
					{content}
					<FormNewPost newPost={this.handler} loginState={this.props.loginState}/>
				</div>
			);
		}
		else if (isLoaded && error)
		{
			console.log(error);
			return (
				<div>error</div>
			);
		}
		return (
			<div>Nothing yet</div>
		)
  }
};

class Comment extends Component {
	constructor(props) {
		super(props);
		this.state = {
			_id: this.props.id,
			comments: this.props.comments,
			open: false,
			content: '',
			messageOpen: 'Answer To This Post',
			messageClose: 'Close',
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		EventDispatcher.addCallback(this, LogEngine, "UserChanged", this.userChanged);
	};

	handleChange(e) {
		this.setState({ content: e.target.value });
		e.preventDefault();
	}

	handleSubmit(e) {
		this.setState({ target: e.target, submitClicked: !this.state.submitClicked });
		if (this.controlArguments() && this.props.loginState.user._isLogged)
			this.fetchArguments();
	};

	resetState(newComment) {
		this.setState({
			comments: [...this.state.comments, this.state.content],
			content:	''
		});
	}

	controlArguments() {
		if (this.state.content.length > 0)
			return 1;
		return 0;
	}
	fetchArguments() {
		var data = {
			postId: this.state._id,
			content: this.state.content,
			author: this.props.loginState.user._userName
		};
		fetch(`http://192.168.1.12:8080/posts/${data.postId}/meta/comments`, {
				method: "POST",
				body:		JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
		}).then(res => res.json())
		.then((response) => {
			console.log('Success: ', JSON.stringify(response));
			this.resetState();
		})
		.catch(error => console.error('Error:', error));
	}

	userChanged() {
			this.setState({});
	}

	render() {
		var i = 0;
		var writable = {
			state : this.props.loginState.user._isLogged === true ? 1 : 0,
			message : [ "Vous devez etre connecte pour pouvoir poster un commentaire",
									"Enter here your message"]
		};
		var comments = this.state.comments.map((comment) =>
			<Well key={i++}>
				<div>{comment.content}</div>
				<div>Author: {comment.author}</div>
			</Well>
		);
		return (
			<div className="commentsContainer">
			<Button id="newComment" onClick={() => this.setState({ open: !this.state.open })}>
				{!this.state.open ? this.state.messageOpen : this.state.messageClose }
			</Button>
			<Collapse in={this.state.open}>
				<div>
					{comments}
					<FormControl componentClass="textarea" className="txtAreaComment"
					placeholder={writable.message[writable.state]} value={this.state.content} onChange={this.handleChange} readOnly={!writable.state}/>
					<Button type="submit" className="publishButton publishComment" onClick={this.handleSubmit} bsStyle="primary">
						Publish
					</Button>
				</div>
			</Collapse>
			</div>
		)
	}
};

class FormNewPost extends Component {
	constructor(props) {
		super(props);
		this.state = {
			content:	'',
			title:		'',
			newPosts: 0
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		EventDispatcher.addCallback(this, LogEngine, "UserChanged", this.userChanged);
	};

	resetState() {
		this.setState({
			content:	'',
			title:		'',
			newPosts: this.state.newPosts + 1
		}
	);
	}
	controlArguments() {
		if (this.state.title && this.state.content)
			return 1;
		return 0;
	}

	fetchArguments() {
		var data = {
			title: this.state.title,
			content: this.state.content,
			author: this.props.loginState.user._userName
		};
		console.log("Arguments ready to be fetched");
		fetch("http://192.168.1.12:8080/posts", {
				method: "POST",
				body:		JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
		}).then(res => res.json())
		.then((response) => {
			console.log('Success: ', JSON.stringify(response));
			this.props.newPost();
		})
		.catch(error => console.error('Error:', error));
		this.resetState();
	}

	handleSubmit(e) {
		if (this.controlArguments())
			this.fetchArguments();
	};

	handleChange(e) {
		if (e.target.id === "newPostTitle")
			this.setState({ title:	e.target.value });
		else if (e.target.id === "newPostContent")
		this.setState({ content:	e.target.value });
		e.preventDefault();
	};

	userChanged() {
			this.setState({});
	}

	render(){
		if (!this.props.loginState.user._isLogged)
			return (
				<Alert bsStyle="warning">
	  			<strong>You Need to be connected before writing a comment.</strong>
			</Alert>
			);
		else
			return (
				<form onSubmit={this.handleChange}>
					<FormGroup className="postContainer">
						<h5>Publiate a new post</h5>
						<Col className="postTitleContainer" xs={5}>
							<FormControl id="newPostTitle" type="text" label="Text" placeholder="Title"
								value={this.state.title} onChange={this.handleChange}/>
						</Col>
						<FormControl id="newPostContent" componentClass="textarea"
						placeholder="Enter here your message" value={this.state.content} onChange={this.handleChange}/>
							<Button type="submit" className="publishButton" bsStyle="primary"
							onClick={this.handleSubmit}>Publish</Button>
						{this.state.newPosts}
				</FormGroup>
				</form>
			);
	}
}

class LogEngine extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userName: '',
			isLogged: false,
			error:		null
		};
		this._handleChange = this._handleChange.bind(this);
		this._handleLogIn = this._handleLogIn.bind(this);
		this._handleLogOut = this._handleLogOut.bind(this);

		this._getUserConnected();

	};

	_getUserConnected() {
		var session = sessionStorage.getItem( 'userSession' );
		if (session && session !== undefined)
		{
			console.log(session);
			fetch(`http://localhost:8080/login/${session}`)
				.then(res => res.json())
				.then( (res) => {
					if (res.user && res.user[0].isLogged)
						this.setState({
							userName: session,
							isLogged: true,
							error:		null
						});
						this.props.loginState.userName = this.state.userName;
						this.props.loginState.isLogged = this.state.isLogged;
						EventDispatcher.sendEvent(this, "UserChanged", {isLogged:  true});
				},
				(err) => {
					this.setState({
						isLogged: false,
						error:		err
					});
			});
		}
	}

	_registerUser() {
		fetch(`http://localhost:8080/login/${this.state.userName}`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
				}
			}).then(res => res.json())
			.then( (res) => {
				if (!res.user.isLogged)
				{
					this.setState({
						userName: res.user.userName,
						isLogged: true,
						error:		null
					});
					sessionStorage.setItem( 'userSession', res.user.userName );
					this.props.loginState.userName = this.state.userName;
					this.props.loginState.isLogged = this.state.isLogged;
					EventDispatcher.sendEvent(LogEngine, "UserChanged", {isLogged:  true});
				}
			},
			(err) => {
				this.setState({
					isLogged: false,
					error:		err
				});
		});
	}

	_handleChange(e) {
		this.setState({ userName: e.target.value })
	}

	_handleLogIn(e) {
		if (this.state.userName.length > 0)
			this._registerUser();
	}

	_handleLogOut(e) {
		fetch(`http://localhost:8080/login/${this.state.userName}`, {
			method: "DELETE",
			headers: {
				'Content-Type': 'application/json'
				}
			}).then(res => res.json())
			.then( (res) => {
				this.setState({
					userName: '',
					isLogged: false,
					error:		null
				});
				sessionStorage.removeItem( 'userSession' );
				this.props.loginState.userName = this.state.userName;
				this.props.loginState.isLogged = this.state.isLogged;
				EventDispatcher.sendEvent(LogEngine, "UserChanged", {isLogged:  false});
			},
			(err) => {
				this.setState({
					isLogged: false,
					error:		err
				});
		});
	}

	render() {
		if (!this.state.isLogged)
			return(
				<div className="logEngine">
					Not Logged
					<FormControl id="newPostTitle" type="text" label="Text" placeholder="userName"
						value={this.state.userName} onChange={this._handleChange}/>
					<Button type="submit" className=""
					onClick={this._handleLogIn}>Log In</Button>
				</div>
			);
		else
			return(
				<div className="logEngine">
					Logged As {this.state.userName}
					<Button type="submit" className=""
					onClick={this._handleLogOut}>Log Out</Button>
				</div>
			);
	};
}

function App() {
	var loginState = {
		_user: {
			_userName: '',
			_isLogged: null,
		},
		set userName(userName) {
			this._user._userName = userName;
		},
		set isLogged(isLogged) {
			this._user._isLogged = isLogged;
		},
		get user() {
			return this._user;
		}
	};
	return (
		<div>
			<LogEngine loginState={loginState}/>
			<Post loginState={loginState}/>
		</div>
	)
}
export default App;
