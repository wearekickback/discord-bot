const { Client } = require('discord.js')
const moment = require('moment')
const client = new Client()
var _ = require('lodash')
import {
  handleSubmission,
  handleActivity,
  handleLeaderboard,
  handleHelp,
  handleSetEthAddress,
} from './botHandlers'

const actions = {
  activity: 'activity',
  submission: 'submission',
  leaderboard: 'leaderboard',
  help: 'help',
  setEthAddress: 'setEthAddress',
}

function getAction(message) {
  if (message.startsWith('/activity')) {
    return actions.activity
  }

  if (message.startsWith('/submit')) {
    return actions.submission
  }

  if (message.startsWith('/leaderboard')) {
    return actions.leaderboard
  }

  if (message.startsWith('/help')) {
    return actions.help
  }

  if (message.startsWith('/setEthAddress')) {
    return actions.setEthAddress
  }
}

function setupBot() {
  const token = process.env.DISCORD_TOKEN
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
  })

  client.on(
    'message',
    Meteor.bindEnvironment((msg) => {
      console.log({ msg })
      if (msg.author.bot) {
        return
      }
      const chennelId = msg.channel.id
      const channelName = msg.channel.name
      const authorId = msg.author.id
      const authorName = msg.author.username
      const message = msg.content
      if (!channelName.startsWith('stak')) {
        return
      }
      let action = getAction(message)

      switch (action) {
        case 'activity':
          console.log('handling activity')
          handleActivity(msg)
          break
        case 'submission':
          console.log('handling submission')
          handleSubmission(msg)
          break
        case 'leaderboard':
          console.log('handling leaderboard')
          handleLeaderboard(msg)
          break
        case 'help':
          console.log('handling help')
          handleHelp(msg)
          break
        case 'setEthAddress':
          console.log('handling setEthAddress')
          handleSetEthAddress(msg)
          break
        default:
          console.log('no action provided for this message')
      }
    })
  )

  client.login(token)
}

export default setupBot
