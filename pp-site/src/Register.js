import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

class Register extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showModal: false,
		};
	}

	close() {
		this.setState({
			showModal: false,
		});
	}

	open() {
		this.setState({
			showModal: true,
		});
	}

	render() {
		return (
			<Modal show={this.props.showModal} onHide={this.close}>
				<Modal.Header closeButton>

				</Modal.Header>
			</Modal>

		);
	}
}

export default Register;
