import { MessageEmbed } from 'discord.js'
import moment from 'moment'

import { addressUtils } from '@0x/utils'

import Submissions from '../imports/api/submissions'
import ChatUsers from '../imports/api/chatUsers'

function sendBotMessage({ title, description, message }) {
  const embed = new MessageEmbed()
    .setTitle(title)
    .setColor(0xff0000)
    .setDescription(description)

  message.channel.send(embed)
}

function getCount(string) {
  function getLastWord(words) {
    var n = words.trim().split(' ')
    return n[n.length - 1]
  }

  const lastWord = getLastWord(string)
  const count = parseInt(lastWord)
  if (isNaN(count)) {
    return 0
  }

  return count
}

export function handleSubmission(message) {
  console.log('adding submission')
  console.log({ message })
  let url
  if (message.embeds.length > 0) {
    url = message.embeds[0].url
  }
  if (message.attachments.array().length > 0) {
    let a = message.attachments.array()
    url = a[0].url
  }

  if (!url) {
    sendBotMessage({
      title: 'Incorrect submission',
      description: 'Please an embed or an attachment to submit',
      message,
    })
    return
  }
  Submissions.insert({
    discordUsername: message.author.username,
    discordUserId: message.author.id,
    createdAt: new Date(),
    channelId: message.channel.id,
    url,
    count: getCount(message.content),
  })

  sendBotMessage({
    title: 'Submission accepted!',
    description: 'Type /activity to see all your submissions',
    message,
  })
}

function getTotalCount(submissions) {
  return submissions.reduce((sum, submission) => {
    if (!submission.count) return sum
    return sum + submission.count
  }, 0)
}

function getDaysCompleted(submissions) {
  return submissions.filter((s, index, array) => {
    return (
      index ===
      array.findIndex((t) => datesAreOnSameDay(t.createdAt, s.createdAt))
    )
  }).length
}

const datesAreOnSameDay = (firstDate, secondDate) => {
  const first = new Date(firstDate)
  const second = new Date(secondDate)
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

export function handleActivity(message) {
  const mentions = message.mentions.users.array()
  const submissions = Submissions.find({
    discordUserId: mentions.length > 0 ? mentions[0].id : message.author.id,
    channelId: message.channel.id,
  }).fetch()

  const daysCompleted = getDaysCompleted(submissions)
  const totalCount = getTotalCount(submissions)
  console.log(totalCount)

  const sender = mentions.length > 0 ? mentions[0] : message.author

  if (!submissions) {
    sendBotMessage({
      title: 'No submissions found',
      message,
    })
  }
  const submissionsString = submissions
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(
      (s) => `
    ${moment(s.createdAt).fromNow()} - ${s.url} ${
        s.count && s.count > 0
          ? ` - ${s.count} time${s.count > 1 ? 's' : ''}`
          : ''
      }
  `
    )
  const totalSubmissions = submissions.length

  const description = `
    Total Submissions: ${totalSubmissions}
    Days Completed: ${daysCompleted}
    ${totalCount > 0 ? `Total Count: ${totalCount}` : ''}
    ${submissionsString.join('')}
  `
  console.log({ submissions })

  sendBotMessage({
    title: 'Activity for ' + sender.username,
    description,
    message,
  })
}

export function handleLeaderboard(message) {
  const channelId = message.channel.id
  const submissions = Submissions.find({
    channelId: message.channel.id,
  }).fetch()

  // get all users
  const users = submissions.reduce((acc, submission) => {
    if (acc[submission.discordUsername]) {
      acc[submission.discordUsername].push(submission)
    } else {
      acc[submission.discordUsername] = [submission]
    }
    return acc
  }, {})

  const usernames = Object.keys(users)

  const daysCompletedPerUsers = usernames.map((username) => {
    return {
      username,
      daysCompleted: getDaysCompleted(users[username]),
    }
  })

  const orderedDaysCompleted = daysCompletedPerUsers.sort((a, b) => {
    return b.daysCompleted - a.daysCompleted
  })

  const description = `
    ${orderedDaysCompleted
      .map(
        (user, index) =>
          `${index + 1}) ${user.username} - ${user.daysCompleted} day${
            user.daysCompleted > 1 ? 's' : ''
          } completed`
      )
      .join(`\n`)}
  `

  sendBotMessage({
    title: 'Leaderboard',
    description,
    message,
  })
  // rank them by amount of days completed
}

export function handleHelp(message) {
  const description = `
    /help - shows this tooltip!
    /submit [link/video] [count] - records a submission for today. Count is optional and must be the last argument.
    /activity [username] - Gives activity on a user, defaults to yourself
    /leaderboard - short summary of how everyone is doing!
    /setEthAddress [ethAddress] - set your username to your kickback account via the ethereum address
  `

  sendBotMessage({
    title: 'Help',
    description,
    message,
  })
}

function getSecondPart(str) {
  return str.split(' ')[1]
}

export function handleSetEthAddress(message) {
  const address = getSecondPart(message.content)

  if (!addressUtils.isAddress(address)) {
    sendBotMessage({
      title: 'Invalid Ethereum address',
      description: 'Please check your address and try again',
      message,
    })
  }
  const user = ChatUsers.findOne({ discordUsername: message.author.username })

  let id
  if (user) {
    id = ChatUsers.update({ id: user.id }, { address })
  } else {
    id = ChatUsers.insert({ discordUsername: message.author.username, address })
  }

  if (id) {
    sendBotMessage({
      title: `Set Ethereum address successful!`,
      description: `${message.author.username}'s ethereum address has been set to ${address}`,
      message,
    })
  }
}
