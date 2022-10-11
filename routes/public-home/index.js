'use strict'

//
//
// Imports
// ############################################
const express = require('express')

//
//
// Setup
// ############################################
const router = express.Router()

//
//
// Methods
// ############################################
router.get('/', (req, res, next) => {
  return res.render('public-home/overview')
})

router.get('/privacy', (req, res, next) => {
  return res.render('public-home/privacy')
})

router.get('/terms', (req, res, next) => {
  return res.render('public-home/terms')
})

module.exports = router
