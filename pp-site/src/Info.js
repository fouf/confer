import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

class Info extends Component {
	constructor(props) {
		super(props);
		this.close = this.close.bind(this);
	}
	close() {
		this.props.onCloseClick();
	}
	render() {
		return (
			<Modal show={this.props.show} onHide={this.close}>
				<Modal.Header closeButton>
					<Modal.Title>poeking - {this.props.title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{this.props.message}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.close}>Close</Button>
				</Modal.Footer>
			</Modal>
		);
	}

}

export default Info;
