import React, { Component } from 'react';

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
				<ul>
					{users}
				</ul>
			</div>
		);
	}
}

export default UserList;
