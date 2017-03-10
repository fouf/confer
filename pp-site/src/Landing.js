import React, { Component } from 'react';
import { Jumbotron } from 'react-bootstrap';
class Landing extends Component {
	render() {
		return (
			<div>
				<Jumbotron>
					<h1>Welcome</h1>
					<p>You can sign in at the top right of the screen.</p>
					<p>If you don't have an account, you can click the `No account? Register` button from the drop down.</p>
				</Jumbotron>
			</div>
		);
	}
}

export default Landing;
