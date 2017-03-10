import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';

import Conversation from './Conversation.js';

class ConversationList extends Component {


	render() {
		var convos = [];
		if (this.props.conversations !== undefined) {
			for (let v of Object.values(this.props.conversations)) {
				var size = 0;
				if (v.users !== undefined) {
					size = Object.keys(v.users).length;
				}

				convos.push(<Conversation key={v.ID} id={v.ID} name={v.Name} size={size} handler={this.props.handler} />);
			}	
		}
		return (
			<span>
				<ListGroup id="convos">
					{convos}
				</ListGroup>
			</span>
		);
	}
}

export default ConversationList;
