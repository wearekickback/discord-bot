import React, { Component } from 'react'
import { withTracker } from 'meteor/react-meteor-data'
import Submissions from '../api/submissions'

class Info extends Component {
  render() {
    const links = this.props.links.map((link) => this.makeLink(link))

    return (
      <div>
        <h2>Learn Meteor!</h2>
        <ul>{links}</ul>
      </div>
    )
  }

  makeLink(link) {
    return (
      <li key={link._id}>
        <a href={link.url} target="_blank">
          {link.url}
        </a>
      </li>
    )
  }
}

export default InfoContainer = withTracker(() => {
  return {
    links: Submissions.find().fetch(),
  }
})(Info)
