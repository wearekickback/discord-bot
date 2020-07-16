import { Meteor } from 'meteor/meteor'
import Submissions from '/imports/api/submissions'
import setupBot from './bot'
import dotenv from 'dotenv'

const result = dotenv.config({
  path: `${process.env.PWD}/server/.env`,
  debug: true,
})

Meteor.startup(() => {
  setupBot()
})
