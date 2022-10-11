'use strict'

//
//
// Imports
// ############################################
const mail = require('nodemailer')
const fs = require('fs')
const hbs = require('hbs')

//
//
// Setup
// ############################################
const transporter = mail.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SMTP_AUTH_USER,
    pass: process.env.EMAIL_SMTP_AUTH_PASS
  }
})

//
//
// Methods
// ############################################
exports.send = async (args) => {
  const template = fs.readFileSync(args.view, 'utf-8')
  const generateEmail = hbs.handlebars.compile(template)
  const uniqueID = Math.random().toString(16).substr(2, 8)

  const result = await transporter.sendMail({
    headers: {
      'X-Entity-Ref-ID': uniqueID
    },
    from: process.env.EMAIL_FROM_ADDRESS,
    to: args.to,
    cc: args.cc,
    bcc: args.bcc,
    subject: args.subject,
    html: generateEmail(args.data)
  })

  return result.response
}
