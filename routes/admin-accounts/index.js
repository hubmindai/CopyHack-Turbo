'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const lodash = require('lodash')
const accountModel = require('../../models/account')
const userModel = require('../../models/user')
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
    const requestedOffset = (req.query.page ? req.query.page - 1 : 0) * 10

    const accounts = await accountModel.getActive({
      offset: requestedOffset
    })

    return res.render('admin-accounts/overview', {
      accounts: accounts,
      list_state: { current_page: req.query.page }
    })
  } catch (error) { next(error) }
})

router.get('/:account_id/edit', async (req, res, next) => {
  try {
    const requestedOffset = (req.query.page ? req.query.page - 1 : 0) * 10

    const account = await accountModel.getByID({
      account_id: req.params.account_id
    })

    if (!account[0]) {
      return next({ userErrorMessage: 'Account not found', status: 500 })
    }

    const users = await userModel.getActiveByAccountID({
      account_id: req.params.account_id,
      offset: requestedOffset
    })

    const featuresWithStatus = featuresConfig
    for (const i in featuresWithStatus) {
      featuresWithStatus[i].is_subscribed = (featuresWithStatus[i].id === account.current_feature_tier)
    }

    const subscribedFeature = (lodash.filter(featuresWithStatus, { is_subscribed: true }))[0]

    return res.render('admin-accounts/edit', {
      account: account[0],
      users: users,
      subscribed_feature: subscribedFeature,
      list_state: { current_page: req.query.page }
    })
  } catch (error) { next(error) }
})

router.delete('/:account_id', async (req, res, next) => {
  try {
    await accountModel.delete({
      account_id: req.params.account_id
    })
    req.log.info(`account ${req.params.account_id} deleted by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('../accounts')
  } catch (error) { next(error) }
})

module.exports = router
