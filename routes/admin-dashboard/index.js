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
    return res.render('admin-dashboard/overview')
  } catch (error) { next(error) }
})

module.exports = router
