'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const userModel = require('../../models/user')
const emailService = require('../../services/email')
const { body, validationResult } = require('express-validator')

//
//
// Setup
// ############################################
const router = express.Router()

//
//
// Methods
// ############################################
router.get('/new', async (req, res, next) => {
  try {
    return res.render('user-help/new')
  } catch (error) { next(error) }
})

router.post('', async (req, res, next) => {
  try {
    await body('title').isLength({ min: 3 }).withMessage('Title is required').run(req)
    await body('description').isLength({ min: 3 }).withMessage('Description is required').run(req)
    await body('severity').isLength({ min: 3 }).withMessage('Severity is required').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      res.status(422).render('user-help/new', {
        case: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    const user = await userModel.getByID({
      user_id: res.locals.authenticated_user.user_id
    })

    const emailData = {
      form: req.body,
      user: user[0],
      app_host_url: process.env.APP_HOST_URL,
      company_short_name: process.env.COMPANY_SHORT_NAME
    }

    const uniqueCaseID = Math.random().toString(16).substr(2, 8)

    await emailService.send({
      to: process.env.COMPANY_GENERAL_EMAIL,
      subject: `${process.env.COMPANY_SHORT_NAME} - New Support Case - ${uniqueCaseID}`,
      view: './emails/new-support-case-admin.hbs',
      data: emailData
    })

    await emailService.send({
      to: emailData.user.email,
      cc: process.env.COMPANY_GENERAL_EMAIL,
      subject: `${process.env.COMPANY_SHORT_NAME} - New Support Case - ${uniqueCaseID}`,
      view: './emails/new-support-case-user.hbs',
      data: emailData
    })

    req.log.info(`support case submitted by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('help/new')
  } catch (error) { next(error) }
})

module.exports = router
