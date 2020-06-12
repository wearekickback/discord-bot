const { Client } = require('discord.js')
const moment = require('moment')
const client = new Client()
var _ = require('lodash')
import { handleSubmission, handleActivity } from './botHandlers'

// const handleMessages = (messages, msg) => {
//   const mention = msg.mentions.users.first()
//   let lastMessage
//   console.log({ mention })
//   a = messages.first(100).map((m) => {
//     let embed, embedTitle, embedType, embedUrl, imageUrl
//     messageId = m.id
//     if (m.embeds.length) {
//       embed = m.embeds[0]
//       embedTitle = embed.title
//       embedType = embed.type
//       embedUrl = embed.url
//     }
//     const attachement = m.attachments.length ? m.attachments[0] : null
//     let obj = {
//       content: m.content,
//       createdTimestamp: m.createdTimestamp,
//       createdAt: m.createdAt,
//       messages: m.message,
//       authorId: m.author.id,
//       channelId: m.channel.id,
//       attachement,
//       embed,
//       messageId,
//     }
//     lastMessage = obj
//     if (embedUrl && m.author.id === mention.id) {
//       msg.channel.send(
//         `${moment(m.createdAt).fromNow()} ${embedTitle}  <${embedUrl}>`
//       )
//     }
//   })
//   return lastMessage
// }

const actions = {
  activity: 'activity',
  submission: 'submission',
}

function getAction(message) {
  if (message.startsWith('/activity')) {
    return actions.activity
  }

  if (message.startsWith('/submit')) {
    return actions.submission
  }
}

// function handleActivity() {
//   function fetchMessage(msg, messageId) {
//     console.log({ messageId })
//     msg.channel.messages
//       .fetch({ limit: 100, before: messageId })
//       .then((messages) => {
//         console.log(`${msg.channel.name} Received ${messages.size} messages`)
//         const lastMessage = handleMessages(messages, msg)
//         if (lastMessage && lastMessage.messageId != messageId) {
//           fetchMessage(msg, lastMessage.messageId)
//         } else {
//           console.log('no more messages', { lastMessage })
//         }
//       })
//   }
//   msg.channel.messages
//     .fetch({ limit: 100 })
//     .then((messages) => {
//       console.log(`${msg.channel.name} Received ${messages.size} messages`)
//       console.log({ messages })
//       const lastMessage = handleMessages(messages, msg)
//       fetchMessage(msg, lastMessage.messageId)
//     })
//     .catch(console.error)
// }

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
      if (channelName !== 'makoto') {
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
        default:
          console.log('no action provided for this message')
      }
    })
  )

  client.login(token)
}

export default setupBot
