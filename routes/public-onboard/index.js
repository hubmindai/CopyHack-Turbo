//
//
// Imports
// ############################################
const express = require('express')
const lodash = require('lodash')
const accountModel = require('../../models/account')
const userModel = require('../../models/user')
const emailService = require('../../services/email')
const paymentService = require('../../services/payments')
const { body, validationResult } = require('express-validator')
const featuresConfig = require('../../config/features').config

//
//
// Setup
// ############################################
const router = express.Router()

//
//
// Methods
// ############################################
router.get('', async (req, res, next) => {
  try {
    const existingUser = await userModel.getByEmail({
      email: req.user.email
    })
    const userExists = existingUser.length !== 0
    const appSignupEnabled = process.env.APP_SIGNUP_ENABLED === 'true'

    if (userExists) {
      return res.redirect('/user/dashboard')
    }

    return res.render('public-onboard/overview', {
      app_signup_enabled: appSignupEnabled,
      user_exists: userExists
    })
  } catch (error) { next(error) }
})

router.post('/setup', async (req, res, next) => {
  try {
    await body('name').isLength({ min: 3 }).withMessage('Name field error').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('public-onboard/overview', {
        app_signup_enabled: true,
        user_exists: false,
        user: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    const customer = await paymentService.createStripeCustomer()

    const newAccount = await accountModel.create({
      name: 'Main',
      stripe_customer_id: customer.id,
      current_feature_tier: lodash.filter(featuresConfig, { is_default: true })[0].id
    })
    req.log.info(`account ${newAccount[0]} created`)

    const newUser = await userModel.create({
      account_id: newAccount[0],
      name: req.body.name,
      email: req.user.email,
      is_system_admin: req.user.email === process.env.INITIAL_SYSTEM_ADMIN_EMAIL
    })
    req.log.info(`user ${newUser[0]} for account ${newAccount[0]} created`)

    // Send welcome email to user
    await emailService.send({
      to: req.user.email,
      subject: `${process.env.COMPANY_SHORT_NAME} - Welcome`,
      view: './emails/welcome.hbs',
      data: {
        company_general_email: process.env.COMPANY_GENERAL_EMAIL,
        company_short_name: process.env.COMPANY_SHORT_NAME
      }
    })

    const user = await userModel.getByID({
      user_id: newUser[0]
    })

    // Send new account user to admin
    await emailService.send({
      to: process.env.COMPANY_GENERAL_EMAIL,
      subject: `${process.env.COMPANY_SHORT_NAME} - New Account - ${user[0].email}`,
      view: './emails/new-account.hbs',
      data: {
        user: user[0],
        app_host_url: process.env.APP_HOST_URL
      }
    })

    return res.redirect('/user/dashboard')
  } catch (error) { next(error) }
})

module.exports = router
