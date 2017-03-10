import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

class Register extends Component {
	constructor(props) {
		super(props);
		
	}

	render() {
		return (
			<Modal show={this.props.show} onHide={this.close}>
				<Modal.Header closeButton>

				</Modal.Header>
			</Modal>

		);
	}
}

export default Register;
