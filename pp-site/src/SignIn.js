import React, { Component } from 'react';
import { FormGroup, InputGroup, FormControl, Popover, Button, OverlayTrigger } from 'react-bootstrap';
import Info from './Info';
class SignIn extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: 0,
			infoShow: false,
			infoMessage: "",
			password: "",
			confirmPassword: "",
			rUsernameValidation: null,
			rPasswordValidation: null,
			rConfirmPasswordValidation: null,
			signedIn: (window.localStorage.getItem('token') !== null),
			username: window.localStorage.getItem('username'),
		};
		this.toggleMode = this.toggleMode.bind(this);
		this.onSignInClick = this.onSignInClick.bind(this);
		this.onSignOutClick = this.onSignOutClick.bind(this);
		this.onRegisterClick = this.onRegisterClick.bind(this);
		this.handleUsernameChange = this.handleUsernameChange.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handlePasswordConfirmChange = this.handlePasswordConfirmChange.bind(this);
		this.infoCloseClick = this.infoCloseClick.bind(this);
	}
	toggleMode() {
		this.setState({
			rUsernameValidation: null,
			rPasswordValidation: null,
			rConfirmPasswordValidation: null,
		});
		const m = this.state.mode;
		this.setState({
			mode: m === 0 ? 1 : 0,
		});
	}
	handleUsernameChange(e) {
		this.setState({
			username: e.target.value,
		});
	}
	handlePasswordChange(e) {
		this.setState({
			password: e.target.value,
		});
	}
	handlePasswordConfirmChange(e) {
		this.setState({
			confirmPassword: e.target.value,
		});
	}
	updateUserInfo() {
		fetch('/api/user/info', {
			method: 'POST',
			body: JSON.stringify({
				token: window.localStorage.getItem('token'),
			})
		})
			.then((resp) => {
				if (resp.ok) {
					return resp.json();
				}
				return resp.text()
					.then((error) => {
						throw new Error(error);
					});
			})
			.then((responseJson) => {
				this.setState({
					username: responseJson.username,
				});
				console.log("Received user info");
			})
			.catch((error) => {
				console.error(error);
			});
	}
	onRegisterClick(e) {
		e.preventDefault();
		this.setState({
			rConfirmPasswordValidation: null,
			rUsernameValidation: null,
			rPasswordValidation: null,
		});
		if (this.state.password.length < 6 || this.state.password.length > 64) {
			this.setInfoMessage("error", "Password must be between 6 and 64 characters in length.");
			this.setState({
				rPasswordValidation: "error",
			});
			this.rPasswordInput.focus();
			return;
		}
		if (this.state.username.length < 6 || this.state.username.length > 16) {
			this.setInfoMessage("error", "Username must be between 4 and 16 characters in length.");
			this.setState({
				rUsernameValidation: "error",
			});
			this.rUserInput.focus();
			return;
		}
		if (this.state.password !== this.state.confirmPassword) {
			this.setInfoMessage("error", "Passwords do not match.");
			this.setState({
				rPasswordValidation: "error",
				rConfirmPasswordValidation: "error",
			});
			this.rPasswordInput.focus();
			return;
		}
		if (!this.state.username.match(/^[0-9a-zA-Z]+$/)) {
			this.setInfoMessage("error", "Username must be alphanumeric.");
			this.rUserInput.focus();
			return;

		}
		fetch('/api/v1/register', {
			method: 'POST',
			body: JSON.stringify({
				username: this.state.username,
				password: this.state.password,
			})
		})
			.then((resp) => {
				if (resp.ok) {
					return resp.json();
				}
				return resp.text()
					.then((error) => {
						throw new Error(error);
					});
			})
			.then((responseJson) => {
				console.log(responseJson);
			})
			.catch((error) => {
				if (error.message === "username-taken\n") {
					this.setInfoMessage("error", "That username has been taken, please choose another.");
					this.setState({
						rUsernameValidation: "error",
					});
					this.rUserInput.focus();
				}
				console.error(error);
			});
		return false;
	}
	onSignOutClick(e) {
		e.preventDefault();
		fetch('/api/logout', {
			method: 'POST',
			body: JSON.stringify({
				token: window.localStorage.getItem('token'),
			}),
		})
			.then((resp) => {
				return resp.text();
			})
			.then((responseJson) => {
				console.log('Logged out.');
				window.localStorage.removeItem('token');
				window.localStorage.removeItem('username');
				this.setState({
					signedIn: false,
					username: null,
				});
				window.location.reload();
			})
			.catch((error) => {
				console.error(error);
			});
	}
	onSignInClick(e) {
		e.preventDefault();
		fetch('/api/auth', {
			method: 'POST',
			body: JSON.stringify({
				username: this.state.username,
				password: this.state.password
			})
		})
			.then((resp) => {
				if (resp.ok) {
					return resp.json();
				}
				return resp.text()
					.then((error) => {
						// TODO: custom exceptions?//
						throw new Error(error);
					});
			})
			.then((responseJson) => {
				console.log("Token: " + responseJson.token);
				window.localStorage.setItem('token', responseJson.token);
				this.setState({
					signedIn: true,
				});
				this.infoCloseClick();
				this.updateUserInfo()
				window.location.reload();
			})
			.catch((error) => {
				this.setInfoMessage('Login error', 'Please double check your username and password');
				console.error('an error: ' + error);
			});
		return false;
	}
	infoCloseClick() {
		this.setState({
			infoShow: false,
		});
	}
	setInfoMessage(t, m) {
		this.setState({ 
			infoMessage: m,
			infoTitle: t,
			infoShow: true,
		});
	}
	render() {
		const popovers = [];
		popovers[0] = (
			<Popover id="popover-positioned-bottom" onClick={this.signIn}>
				<form onSubmit={this.onSignInClick} >
					<FormGroup validationState={this.state.rUsernameValidation}>
						<InputGroup>
							<FormControl placeholder="username" inputRef={ref => { this.rUserInput = ref; }} onChange={this.handleUsernameChange} type="text" />
						</InputGroup>
					</FormGroup>
					<FormGroup validationState={this.state.rPasswordValidation}>
						<InputGroup>
							<FormControl placeholder="password" inputRef={ref => { this.rPasswordInput = ref; }} onChange={this.handlePasswordChange} type="password" />
						</InputGroup>
					</FormGroup>
					<Button block bsStyle="primary" type="submit">Sign in</Button>
				</form>
				<br />
				<Button block onClick={this.toggleMode} type="button">No account? Register</Button>
			</Popover>
		);
		popovers[1] = (
			<Popover id="popover-positioned-bottom" onClick={this.signIn}>
				<form onSubmit={this.onRegisterClick}>
					<FormGroup validationState={this.state.rUsernameValidation}>
						<InputGroup>
							<FormControl placeholder="username" inputRef={ref => { this.rUserInput = ref; }} onChange={this.handleUsernameChange} type="text" />
						</InputGroup>
					</FormGroup>
					<FormGroup validationState={this.state.rPasswordValidation}>
						<InputGroup>
							<FormControl placeholder="password" inputRef={ref => { this.rPasswordInput = ref; }} onChange={this.handlePasswordChange} type="password" />
						</InputGroup>
					</FormGroup>
					<FormGroup validationState={this.state.rConfirmPasswordValidation}>
						<InputGroup>
							<FormControl placeholder="confirm password" inputRef={ref => { this.rConfirmPasswordInput = ref; }} onChange={this.handlePasswordConfirmChange} type="password" />
						</InputGroup>
					</FormGroup>
					<Button block bsStyle="primary" type="submit">Register</Button>
				</form>
				<br />
				<Button block onClick={this.toggleMode} type="button" href="#">Have an account? Login</Button>
			</Popover>
		);

		const popover = popovers[this.state.mode];
		return (
			<span>
				{!this.state.signedIn ? (
					<OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
						<Button bsSize="xsmall">Sign in</Button>
					</OverlayTrigger>
				) : (
					<Button onClick={this.onSignOutClick} bsSize="xsmall">Sign out</Button>
				)}
				<Info title={this.state.infoTitle} message={this.state.infoMessage} show={this.state.infoShow} onCloseClick={this.infoCloseClick} />
			</span>
		);
	}
}

export default SignIn;
