'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const userModel = require('../models/user')

//
//
// Setup
// ############################################
const router = express.Router()

//
//
// Methods
// ############################################
router.get('/check', async (req, res, next) => {
  try {
    await userModel.getByID({
      user_id: null
    })

    return res.sendStatus(200)
  } catch (error) { next(error) }
})

exports.routes = router
