import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';
import Message from './Message.js';

class MessageList extends Component {
	componentWillUpdate() {
		this.shouldScrollBottom = this.s.scrollTop + this.s.offsetHeight === this.s.scrollHeight;
	}

	componentDidUpdate() {
		if (this.shouldScrollBottom) {
			this.s.scrollTop = this.s.scrollHeight;
		}
	}

	render() {
		var messages = [];
		var i = 0;
		var side = 1;
		var lastSender = "";
		if (this.props.messages !== undefined && this.props.messages !== null) {
			for (let v of Object.values(this.props.messages)) {
				if (lastSender !== v.Username) {
					side++;
					lastSender = v.Username;
				}
				messages.push(<Message key={i++} side={side} username={v.Username} message={v.Message} time={v.Time}/>);
			}
		}
		return (
			<div id="messages" ref={(r) => { this.s = r; }}>
				<ListGroup>
					{messages}
				</ListGroup>
			</div>
		);
	}
}

export default MessageList;
