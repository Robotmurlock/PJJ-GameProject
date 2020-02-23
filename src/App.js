import React, { Component } from 'react';
import './App.css';
import Highscore from './Highscore';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="wrapper">
          <Highscore />
        </div>
      </div>
    );
  }
}

export default App;
