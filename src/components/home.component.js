import React, { Component } from "react";

import UserService from "../services/user.service";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: ""
    };
  }

  componentDidMount() {

  }
  render() {
    return (
      <div className="container">
        <header className="jumbotron">
          <h3>home</h3>
        </header>
      </div>
    );
  }
}