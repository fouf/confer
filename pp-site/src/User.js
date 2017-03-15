import React, { Component } from 'react';

class User extends Component {
	render() {
		return (
			<li id="user">{this.props.name}</li>
		);
	}
}

export default User;
