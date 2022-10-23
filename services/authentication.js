'use strict'

//
//
// Imports
// ############################################
const passport = require('passport')
const express = require('express')
const CustomStrategy = require('passport-custom').Strategy
const emailService = require('../services/email')
const userModel = require('../models/user')
const accountModel = require('../models/account')
const authRequestModel = require('../models/authentication-request')
const paymentService = require('../services/payments')
const cryptoUtility = require('../utilities/crypto')
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
exports.authorizePublic = async (req, res, next) => {
  try {
    next()
  } catch (error) { next(error) }
}

exports.authorizeUser = async (req, res, next) => {
  try {
    const userDoesNotExistInRequest = !(req.user && req.user.email)
    if (userDoesNotExistInRequest) {
      return res.redirect('/auth/signin')
    }

    let user = await userModel.getByEmail({
      email: req.user.email
    })

    const userDoesNotExistInDatabase = !user[0]
    if (userDoesNotExistInDatabase) {
      return res.redirect('/onboard')
    }

    let impersonatorUserID
    let impersonatedUserID

    const userIsImpersonating = user[0].impersonated_user_id
    if (userIsImpersonating) {
      impersonatorUserID = user[0].user_id
      impersonatedUserID = user[0].impersonated_user_id
      user = await userModel.getByID({
        user_id: impersonatedUserID
      })
    }

    const account = await accountModel.getByID({
      account_id: user[0].account_id
    })

    if (!account[0]) {
      return next({ userErrorMessage: 'Account does not exist', status: 500 })
    }

    const stripeAccountDoesNotExist = !account[0].stripe_customer_id
    if (stripeAccountDoesNotExist) {
      const customer = await paymentService.createStripeCustomer()
      await accountModel.update({
        account_id: account[0].account_id,
        data: { stripe_customer_id: customer.id }
      })
      account[0].stripe_customer_id = customer.id
    }

    res.locals.authenticated_user = user[0]
    res.locals.impersonator_user_id = impersonatorUserID
    res.locals.impersonated_user_id = impersonatedUserID
    res.locals.authenticated_account = account[0]

    next()
  } catch (error) { next(error) }
}

exports.authorizeAdmin = async (req, res, next) => {
  try {
    const userDoesNotExistInRequest = !(req.user && req.user.email)
    if (userDoesNotExistInRequest) {
      return res.redirect('/auth/signin')
    }

    const user = await userModel.getByEmail({
      email: req.user.email
    })

    const userIsNotSystemAdmin = !(user[0] && user[0].is_system_admin)
    if (userIsNotSystemAdmin) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    const account = await accountModel.getByID({
      account_id: user[0].account_id
    })

    res.locals.authenticated_user = user[0]
    res.locals.authenticated_account = account[0]

    next()
  } catch (error) { next(error) }
}

exports.authorizeOps = async (req, res, next) => {
  try {
    const opsIsNotAuthorized = !(req.params.ops_auth_key === process.env.OPS_AUTH_KEY)
    if (opsIsNotAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    next()
  } catch (error) { next(error) }
}

//
//
// Routes
// ############################################
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((email, done) => {
  done(null, email)
})

const codeLogin = new CustomStrategy(async (req, next) => {
  if (req.body.session_token.length !== 32 || req.body.verification_code.length !== 8) {
    return next(new Error('Authentication pre-checks failed'))
  }

  const authRequest = await authRequestModel.getByVerificationCode({
    verification_code: req.body.verification_code,
    session_token: req.body.session_token
  })

  if (!authRequest[0]) {
    return next(new Error('Authentication request not found'))
  }

  return next(null, { email: authRequest[0].email })
})

passport.use(codeLogin)

router.use(passport.initialize())
router.use(passport.session())

/**
 * Add company information for global use
 */
router.use((req, res, next) => {
  res.locals.company_short_name = process.env.COMPANY_SHORT_NAME
  res.locals.company_legal_name = process.env.COMPANY_LEGAL_NAME
  res.locals.company_general_email = process.env.COMPANY_GENERAL_EMAIL

  next()
})

router.get('/auth/signin', async (req, res, next) => {
  try {
    const userDoesNotExistInRequest = !(req.user && req.user.email)
    if (userDoesNotExistInRequest) {
      return res.render('authenticate', {
        state: 'signin',
        email: req.query.email
      })
    }

    return res.redirect('/user/dashboard')
  } catch (error) { next(error) }
})

router.get('/auth/signup', async (req, res, next) => {
  try {
    const userDoesNotExistInRequest = !(req.user && req.user.email)
    if (userDoesNotExistInRequest) {
      return res.render('authenticate', {
        state: 'signup'
      })
    }

    return res.redirect('/user/dashboard')
  } catch (error) { next(error) }
})

router.post('/auth/requestcode', async (req, res, next) => {
  try {
    await body('email').isEmail().normalizeEmail().withMessage('Invalid email address').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('authenticate', {
        state: 'signin',
        email: req.body.email,
        error: validationsErrors
      })
    }

    const verificationCode = "23456789ABCDEFGHJKMNOPQRSTUVWXYZ";//cryptoUtility.generateRandomString(8, '23456789ABCDEFGHJKMNOPQRSTUVWXYZ')
    const sessionToken = cryptoUtility.generateRandomString()
    const email = req.body.email

    await authRequestModel.create({
      verification_code: verificationCode,
      session_token: sessionToken,
      email: email
    })

    await emailService.send({
      to: email,
      subject: `${process.env.COMPANY_SHORT_NAME} - Authentication`,
      view: './emails/authenticate.hbs',
      data: {
        verification_code: verificationCode,
        company_short_name: process.env.COMPANY_SHORT_NAME
      }
    })

    return res.redirect(`/auth/entercode?session_token=${sessionToken}`)
  } catch (error) { next(error) }
})

router.get('/auth/entercode', async (req, res, next) => {
  try {
    return res.render('authenticate', {
      state: 'entercode',
      session_token: req.query.session_token
    })
  } catch (error) { next(error) }
})

router.post('/auth/verifycode', passport.authenticate('custom', { successRedirect: '/user/dashboard' }), (error, req, res, next) => {
  try {
    if (error) {
      return res.status(422).render('authenticate', {
        state: 'entercode',
        session_token: req.body.session_token,
        error: error
      })
    }
  } catch (error) { next(error) }
})

router.post('/auth/signout', (req, res, next) => {
  try {
    req.session.destroy((e) => {
      req.logOut()
      res.redirect('/auth/signin')
    })
  } catch (error) { next(error) }
})

exports.routes = router
