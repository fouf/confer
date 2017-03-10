import React, { Component } from 'react';
import { ListGroupItem } from 'react-bootstrap';

class Message extends Component {
	render() {
		var side = this.props.side % 2;
		var justify;
		if (side) {
			side = "flex-start";
			justify = "left";
		} else {
			side = "flex-end";
			justify = "right";
		}
		return (
			<div style={{display: 'flex', justifyContent: side}}>
				<ListGroupItem>
					<h4 className="list-group-item-heading heading" style={{textAlign: justify}}>{this.props.username}</h4>
					<div style={{textAlign: justify}}>{this.props.message}</div>
					<br />
					<span className={'time'}>{this.props.time}</span>
				</ListGroupItem>
			</div>
		);
	}
}

export default Message;
