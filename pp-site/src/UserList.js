import React, { Component } from 'react';
import { ListGroup } from 'react-bootstrap';

import User from './User.js';

class UserList extends Component {
	render() {
		var users = [];
		var key = 0;
		if (this.props.users !== undefined) {
			for (let v of Object.values(this.props.users)) {
				users.push(<User key={key++} name={v.username} />);
			}
		}
		return(
			<div>
				<h4>Connected Users</h4>
				<ListGroup>
					{users}
				</ListGroup>
			</div>
		);
	}
}

export default UserList;
