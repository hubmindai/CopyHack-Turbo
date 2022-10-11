'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const userModel = require('../../models/user')

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

    const users = await userModel.getActive({
      offset: requestedOffset
    })

    return res.render('admin-users/overview', {
      users: users,
      list_state: { current_page: req.query.page }
    })
  } catch (error) { next(error) }
})

router.get('/:user_id/edit', async (req, res, next) => {
  try {
    const user = await userModel.getByID({
      user_id: req.params.user_id
    })

    if (!user[0]) {
      return next({ userErrorMessage: 'User not found', status: 500 })
    }

    return res.render('admin-users/edit', {
      user: user[0]
    })
  } catch (error) { next(error) }
})

router.post('/:user_id/impersonate', async (req, res, next) => {
  try {
    await userModel.update({
      user_id: res.locals.authenticated_user.user_id,
      data: {
        impersonated_user_id: req.params.user_id
      }
    })
    req.log.info(`user ${req.params.user_id} impersonated by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('/user/dashboard')
  } catch (error) { next(error) }
})

module.exports = router
