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
router.get('', async (req, res, next) => {
  try {
    return res.render('user-dashboard/overview')
  } catch (error) { next(error) }
})

module.exports = router
