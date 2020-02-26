import React from "react";

import "./Highscore.css";
import GetResults from "./entries";

class Highscore extends React.Component {
  state = { results: [1,2,3] };

  componentDidMount() {
    this.fromMongo();
  }

  async fromMongo() {
    let results = await GetResults.getResults();
    this.setState({results:results});
  }

  render() {
    console.log(this.state);

    let content = this.state.results.map(
      value => 
        <tr className="row">
          <td className="cell" id={value.name}>{value.name}</td>
          <td className="cell" id={value.name}>{value.score}</td>
        </tr>
    );

    return (
      <div className="mainWrapper">
        <table className="board">
          
          <thead>
            <tr class="header">
              <th>Player</th>
              <th>Score</th>
            </tr>
            </thead>

            <tbody>
              {content}
            </tbody>  

        </table>
      </div>
    );
  }
}

export default Highscore;