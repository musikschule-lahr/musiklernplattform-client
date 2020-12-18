import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const app = {
  // Application Constructor
  initialize() {
    function setVw() {
      const vw = document.documentElement.clientWidth / 100;
      document.documentElement.style.setProperty('--vw', `${vw}px`);
    }

    setVw();
    window.addEventListener('resize', setVw);
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },
  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady() {
    ReactDOM.render(<App />, document.getElementById('app'));
  },
};

app.initialize();
