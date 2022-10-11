'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const timezoneSettingsUtil = require('../../utilities/timezone-settings')
const userModel = require('../../models/user')
const { body, validationResult } = require('express-validator')
const lodash = require('lodash')

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
    const user = await userModel.getByID({
      user_id: res.locals.authenticated_user.user_id
    })

    return res.render('user-profile/overview', {
      timezone_options: timezoneSettingsUtil.options,
      user: user[0]
    })
  } catch (error) { next(error) }
})

router.put('', async (req, res, next) => {
  try {
    await body('name').isLength({ min: 5 }).withMessage('Name field error').run(req)
    await body('email').isEmail().normalizeEmail().withMessage('Email field error').run(req)
    await body('phone').isMobilePhone().optional({ nullable: true, checkFalsy: true }).withMessage('Phone field error').run(req)
    const timezoneOptions = lodash.map(timezoneSettingsUtil.options, 'value')
    await body('time_zone').isIn(timezoneOptions).withMessage('Time Zone field error').run(req)
    await body('date_format').isIn(['DD-MM-YYYY', 'MM-DD-YYYY']).withMessage('Date Format field error').run(req)
    await body('time_format').isIn(['24_HOUR', '12_HOUR']).withMessage('Time Format field error').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('user-profile/overview', {
        user: { ...req.body, ...req.params },
        errors: validationsErrors,
        timezone_options: timezoneSettingsUtil.options
      })
    }

    await userModel.update({
      user_id: res.locals.authenticated_user.user_id,
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        time_zone: req.body.time_zone,
        date_format: req.body.date_format,
        time_format: req.body.time_format
      }
    })
    req.log.info(`user ${res.locals.authenticated_user.user_id} updated by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('/user/profile/edit')
  } catch (error) { next(error) }
})

router.post('/exitimpersonation/', async (req, res, next) => {
  try {
    await userModel.update({
      user_id: req.body.impersonator_user_id,
      data: {
        impersonated_user_id: null
      }
    })

    return res.redirect(`/admin/users/${req.body.impersonated_user_id}`)
  } catch (error) { next(error) }
})

module.exports = router
