import { Meteor } from 'meteor/meteor'
import Submissions from '/imports/api/submissions'
import setupBot from './bot'
import dotenv from 'dotenv'

const result = dotenv.config({
  path: `${process.env.PWD}/server/config/.env`,
  debug: true,
})

function insertLink(title, url) {
  Submissions.insert({ title, url, createdAt: new Date() })
}

Meteor.startup(() => {
  // If the Links collection is empty, add some data.
  setupBot()
  if (Submissions.find().count() === 0) {
    insertLink(
      'Do the Tutorial',
      'https://www.meteor.com/tutorials/react/creating-an-app'
    )

    insertLink('Follow the Guide', 'http://guide.meteor.com')

    insertLink('Read the Docs', 'https://docs.meteor.com')

    insertLink('Discussions', 'https://forums.meteor.com')
  }
})
