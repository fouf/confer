import React, { Component } from 'react';
import { ListGroupItem } from 'react-bootstrap';

class User extends Component {
	render() {
		return (
			<ListGroupItem id="user" header={this.props.name} />
		);
	}
}

export default User;
