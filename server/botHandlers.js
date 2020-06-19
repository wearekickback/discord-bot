import { MessageEmbed } from 'discord.js'
import moment from 'moment'

import Submissions from '../imports/api/submissions'

function sendBotMessage({ title, description, message }) {
  const embed = new MessageEmbed()
    .setTitle(title)
    .setColor(0xff0000)
    .setDescription(description)

  message.channel.send(embed)
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
  })

  sendBotMessage({
    title: 'Submission accepted!',
    description: 'Type /activity to see all your submissions',
    message,
  })
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

  const daysCompleted = submissions.filter((s, index, array) => {
    return (
      index ===
      array.findIndex((t) => datesAreOnSameDay(t.createdAt, s.createdAt))
    )
  }).length

  const sender = mentions.length > 0 ? mentions[0] : message.author

  if (!submissions) {
    sendBotMessage({
      title: 'No submissions found',
      message,
    })
  }
  const submissionsString = submissions.map(
    (s) => `
    ${moment(s.createdAt).fromNow()} - ${s.url}
  `
  )
  const totalSubmissions = submissions.length

  const description = `
    Total Submissions: ${totalSubmissions}
    Days Completed: ${daysCompleted}
    ${submissionsString.join('')}
  `
  console.log({ submissions })

  sendBotMessage({
    title: 'Activity for ' + sender.username,
    description,
    message,
  })
}
