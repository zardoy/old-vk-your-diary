import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";

import { store } from "./Redux";
import "./Localization";

// import '@vkontakte/vkui/dist/vkui.css';
import "framework7-icons";
import "./Styles/index.scss";
import "./Styles/f7fixes.css";
import "./Styles/material-icons/material-icons.css"
import "framework7/css/framework7.bundle.min.css";

import App from './App';
import ErrorBoundary from './Components/ErrorBoundary';
import mVKMiniAppsScrollHelper from '@vkontakte/mvk-mini-apps-scroll-helper';

import "./F7Plugins/connect";


mVKMiniAppsScrollHelper(document.getElementById('root'));

if (process.env.NODE_ENV !== "production") console.clear();

ReactDOM.render(
    <ErrorBoundary>
        <Provider store={store}>
            <App />
        </Provider>
    </ErrorBoundary>, document.getElementById('root')
);