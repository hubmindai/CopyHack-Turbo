'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const lodash = require('lodash')
const accountModel = require('../../models/account')
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
router.get('/edit', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    const account = await accountModel.getByID({
      account_id: res.locals.authenticated_user.account_id
    })

    const featuresWithStatus = featuresConfig
    for (const i in featuresWithStatus) {
      featuresWithStatus[i].is_subscribed = (featuresWithStatus[i].id === res.locals.authenticated_account.current_feature_tier)
    }

    const subscribedFeature = (lodash.filter(featuresWithStatus, { is_subscribed: true }))[0]

    return res.render('user-account/overview', {
      account: account[0],
      features_with_status: featuresWithStatus,
      subscribed_feature: subscribedFeature
    })
  } catch (error) { next(error) }
})

router.put('', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    await body('name').isLength({ min: 1 }).withMessage('Name is required').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('user-account/overview', {
        account: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    await accountModel.update({
      account_id: res.locals.authenticated_user.account_id,
      data: { name: req.body.name }
    })
    req.log.info(`account ${res.locals.authenticated_user.account_id} updated by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('/user/account/edit')
  } catch (error) { next(error) }
})

router.delete('', async (req, res, next) => {
  try {
    const userIsAuthorized = res.locals.authenticated_user.account_role === 'MEMBER'
    if (userIsAuthorized) {
      return next({ userErrorMessage: 'Access denied', status: 401 })
    }

    await accountModel.delete({
      account_id: res.locals.authenticated_user.account_id
    })

    return res.redirect('/')
  } catch (error) { next(error) }
})

module.exports = router
