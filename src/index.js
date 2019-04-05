import React, { Component } from 'react';
import Root from './Root';

export default class extends Component {
  render() {
    return <Root config={this.props.config} />;
  }
}
