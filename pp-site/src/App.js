import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import SignIn from './SignIn';
import './App.css';

class App extends Component {
	render() {
		return (
			<div>
				<header>
					<Navbar inverse collapseOnSelect fixedTop>
						<Navbar.Header>
							<Navbar.Brand>
								<a href="/"><i>confer</i></a>
							</Navbar.Brand>
							<Navbar.Toggle />
						</Navbar.Header>
						<Navbar.Collapse>
							<Nav pullRight>
								<NavItem eventKey={2}>
										<SignIn />
								</NavItem>
							</Nav>
						</Navbar.Collapse>
					</Navbar>
				</header>
				<div className="container">
					{this.props.children}
				</div>
				<footer>
				</footer>
			</div>
		);
	}
}

export default App;
