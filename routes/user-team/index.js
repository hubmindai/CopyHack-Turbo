'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const userModel = require('../../models/user')
const { body, validationResult } = require('express-validator')
const emailService = require('../../services/email')

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
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    const requestedOffset = (req.query.page ? req.query.page - 1 : 0) * 10

    const users = await userModel.getActiveByAccountID({
      account_id: res.locals.authenticated_user.account_id,
      offset: requestedOffset
    })

    return res.render('user-team/overview', {
      users: users,
      list_state: { current_page: req.query.page }
    })
  } catch (error) { next(error) }
})

router.get('/new', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    return res.render('user-team/new')
  } catch (error) { next(error) }
})

router.post('', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    await body('name').isLength({ min: 5 }).withMessage('Name field error').run(req)
    await body('email').isEmail().normalizeEmail().withMessage('Email field error').run(req)
    await body('account_role').isLength({ min: 3 }).withMessage('Account Role field error').run(req)
    const validationsErrors = validationResult(req).errors

    const existingUser = await userModel.getByEmail({
      email: req.body.email
    })

    // If the user already exists add that to the list of errors
    const userExist = existingUser.length !== 0
    if (userExist) {
      validationsErrors.errors.push({
        value: '',
        msg: 'User already exists',
        param: 'email',
        body: 'body'
      })
    }

    if (validationsErrors.length) {
      return res.status(422).render('user-team/new', {
        user: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    const user = await userModel.create({
      account_id: res.locals.authenticated_user.account_id,
      name: req.body.name,
      email: req.body.email,
      account_role: req.body.account_role
    })
    req.log.info(`user ${user[0]} invited by user ${res.locals.authenticated_user.user_id}`)

    await emailService.send({
      to: req.body.email,
      subject: `${process.env.COMPANY_SHORT_NAME} - Team Invitation`,
      view: './emails/team-invitation.hbs',
      data: {
        inviter_name: res.locals.authenticated_user.name,
        invited_user_email: req.body.email,
        sign_in_url: `${process.env.APP_HOST_URL}/auth/signin?email=${req.body.email}`,
        company_general_email: process.env.COMPANY_GENERAL_EMAIL,
        company_short_name: process.env.COMPANY_SHORT_NAME
      }
    })

    return res.redirect('team')
  } catch (error) { next(error) }
})

router.get('/:user_id/edit', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    const user = await userModel.getByID({
      user_id: req.params.user_id
    })

    if (!user[0]) {
      return next({ userErrorMessage: 'User not found', status: 500 })
    }

    return res.render('user-team/edit', {
      user: user[0]
    })
  } catch (error) { next(error) }
})

router.put('/:user_id', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    await body('account_role').isLength({ min: 3 }).withMessage('Account role is required').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('user-team/edit', {
        user: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    await userModel.update({
      user_id: req.params.user_id,
      data: {
        account_role: req.body.account_role
      }
    })
    req.log.info(`user ${req.params.user_id} updated by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect(`../team/${req.params.user_id}/edit`)
  } catch (error) { next(error) }
})

router.delete('/:user_id', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    await userModel.delete({
      user_id: req.params.user_id
    })
    req.log.info(`user ${req.params.user_id} deleted by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('/user/team')
  } catch (error) { next(error) }
})

module.exports = router
