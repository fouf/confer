import React  from 'react';
import ReactDOM from 'react-dom';
import { IndexRoute, Router, Route, browserHistory } from 'react-router'
import App from './App';
import Chat from './Chat.js';
import './index.css';

ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
				<IndexRoute component={Chat} />
		</Route>
	</Router>
), document.getElementById('root')
);
