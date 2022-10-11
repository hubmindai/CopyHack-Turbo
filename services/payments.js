'use strict'

//
//
// Imports
// ############################################
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const express = require('express')
const lodash = require('lodash')
const accountModel = require('../models/account')
const featuresConfig = require('../config/features').config

//
//
// Setup
// ############################################
const router = express.Router()

//
//
// Methods
// ############################################
const getFeatureTierByProduct = async (product) => {
  product = product || ''
  const tier = lodash.filter(featuresConfig, { product: product })
  const featureTierNotFoundInFeatures = !tier[0]
  if (featureTierNotFoundInFeatures) {
    throw new Error('Product not found in tiers')
  }

  return tier[0]
}

exports.createStripeCustomer = async (args) => {
  const customer = await stripe.customers.create()

  return customer
}

const syncCustomerStatus = async (args) => {
  const stripeCustomer = await stripe.customers.retrieve(
    args.stripe_customer_id,
    { expand: ['subscriptions'] }
  )

  const stripeCustomHasActiveSubscription = stripeCustomer.subscriptions.data[0]
  if (stripeCustomHasActiveSubscription) {
    const featureTier = await getFeatureTierByProduct(stripeCustomer.subscriptions.data[0].plan.product)

    const featureTierHasChanged = featureTier.id !== args.current_feature_tier
    if (featureTierHasChanged) {
      accountModel.update({
        account_id: args.account_id,
        data: {
          current_feature_tier: featureTier.id
        }
      })
    }
  }

  return true
}

exports.syncCustomerStatus = syncCustomerStatus

//
//
// Routes
// ############################################
exports.processWebhooks = async (req, res, next) => {
  let data = null
  let eventType = null
  let event = null
  const signature = req.headers['stripe-signature']

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) { next(error) }

  data = event.data
  eventType = event.type

  try {
    if (data.customer) {
      await syncCustomerStatus({
        stripe_customer_id: data.customer
      })
      req.log.info(`stripe event ${eventType} for customer ${data.customer} received`)
    }
  } catch (error) { next(error) }

  return res.sendStatus(200)
}

router.get('/initialize', async (req, res, next) => {
  try {
    return res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    })
  } catch (error) { next(error) }
})

router.post('/createcheckoutsession', async (req, res, next) => {
  try {
    const { priceId } = req.body
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: res.locals.authenticated_account.stripe_customer_id,
      line_items: [
        {
          price: priceId,
          // For metered billing, do not pass quantity
          quantity: 1
        }
      ],
      // {CHECKOUT_SESSION_ID} is a string literal; do not change it! The actual Session ID
      // is returned in the query parameter when your customer is redirected to the success page.
      success_url: `${process.env.APP_HOST_URL}/user/account/edit?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_HOST_URL}/user/account/edit?stripe_status=canceled`
    })

    return res.send({
      sessionId: session.id
    })
  } catch (error) { next(error) }
})

router.get('/openbillingportal', async (req, res, next) => {
  try {
    const stripePortalSession = await stripe.billingPortal.sessions.create({
      customer: res.locals.authenticated_account.stripe_customer_id,
      return_url: `${process.env.APP_HOST_URL}/user/account/edit`
    })

    return res.redirect(stripePortalSession.url)
  } catch (error) { next(error) }
})

exports.routes = router
