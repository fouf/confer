import React, { Component } from 'react';
import { ListGroupItem } from 'react-bootstrap';

class Conversation extends Component {

	render() {
		return (
			<div id="conversation">
				<ListGroupItem onClick={() => this.props.handler(this.props.id, this.props.name)} id={this.props.id} header={this.props.name}>
					{this.props.size} users
				</ListGroupItem>
			</div>
		);
	}
}

export default Conversation;
