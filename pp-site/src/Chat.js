import React, { Component } from 'react';
import { Grid, Col, FormControl, FormGroup } from 'react-bootstrap';

import ConversationList from './ConversationList.js';
import UserList from './UserList.js';
import MessageList from './MessageList.js';
import NetMessage from './NetMessage.js';
import Landing from './Landing.js';

class Chat extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chatRoomTitle: "Join a chat on the left",
			chatRoomID: -1,
			loggedIn: window.localStorage.getItem('token') !== null,
		}
		this.conversationOnClick = this.conversationOnClick.bind(this);
		this.onInputKeypress = this.onInputKeypress.bind(this);
	}
	// Handler for when we click one of the chats on the left side
	conversationOnClick(convoID, name) {
		var nm = new NetMessage("join-chat", convoID.toString());
		this.ws.send(nm.json());
		this.setState({
			chatRoomTitle: name,
			chatRoomID: convoID,
		});
	}
	// Handler for when we enter input into the text entry
	onInputKeypress(e) {
		if (e.key === "Enter") {
			var nm = new NetMessage("message", this.textInput.value);
			this.ws.send(nm.json());
			this.textInput.value = "";
		}
	}
	componentDidMount() {
		var t = window.localStorage.getItem('token');
		this.ws = new WebSocket("ws://localhost:3001/api/ws?token="+t);
		this.ws.addEventListener('open', (e) => {
		});
		this.ws.addEventListener('message', (e) => {
			var obj = JSON.parse(e.data);
			switch (obj.type) {
				case "chats":
					this.setState({
						convos: obj.chats,
					});
					break;
				default:
					console.log("Invalid message.");
					break;
			}
		});
	}
	render() {
		var users = undefined;
		var messages = undefined;
		if (this.state.convos !== undefined) {
			if (this.state.convos[this.state.chatRoomID] !== undefined) {
				users = this.state.convos[this.state.chatRoomID].users;
				messages = this.state.convos[this.state.chatRoomID].messages;
			}
		}
		if (this.state.loggedIn) { // should figure out another way to handle this
		return (
			<div id="main-chat">
				<Grid>
					<Col md={2}>
						<ConversationList conversations={this.state.convos} handler={this.conversationOnClick} />
					</Col>
					<Col md={8}>
						<h3>{this.state.chatRoomTitle}</h3>
						<hr />
						<MessageList messages={messages} />
						<FormGroup>
							<FormControl inputRef={(input) => { this.textInput = input; }} type="text" label="message" onKeyPress={this.onInputKeypress} />
						</FormGroup>
					</Col>
					<Col md={2}>
						<UserList users={users} />
					</Col>
				</Grid>
			</div>
		);
		} else {
			return (
				<Landing />
			);
		}
	}
}

export default Chat;
