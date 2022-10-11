'use strict'

//
//
// Imports
// ############################################
const express = require('express')
const thingModel = require('../../models/thing')
const { body, validationResult } = require('express-validator')

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

    const things = await thingModel.getActive({
      account_id: res.locals.authenticated_user.account_id,
      offset: requestedOffset
    })

    return res.render('user-things/overview', {
      things: things,
      list_state: { current_page: req.query.page }
    })
  } catch (error) { next(error) }
})

router.get('/new', async (req, res, next) => {
  try {
    res.render('user-things/new')
  } catch (error) { next(error) }
})

router.post('', async (req, res, next) => {
  try {
    await body('name').isLength({ min: 5 }).withMessage('Name field error').run(req)
    await body('description').isLength({ min: 5 }).withMessage('Description field error').run(req)
    await body('type').isLength({ min: 3 }).withMessage('Type field error').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('user-things/new', {
        thing: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    const thing = await thingModel.create({
      account_id: res.locals.authenticated_user.account_id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type
    })
    req.log.info(`thing ${thing[0]} created by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect(`things/${thing[0]}/edit`)
  } catch (error) { next(error) }
})

router.get('/:thing_id/edit', async (req, res, next) => {
  try {
    const thing = await thingModel.getByID({
      account_id: res.locals.authenticated_user.account_id,
      thing_id: req.params.thing_id
    })

    if (!thing[0]) {
      return next({ userErrorMessage: 'Thing not found', status: 500 })
    }

    return res.render('user-things/edit', {
      thing: thing[0]
    })
  } catch (error) { next(error) }
})

router.put('/:thing_id', async (req, res, next) => {
  try {
    await body('name').isLength({ min: 5 }).withMessage('Name is required').run(req)
    await body('description').isLength({ min: 5 }).withMessage('Description is required').run(req)
    await body('type').isLength({ min: 3 }).withMessage('Type field error').run(req)
    const validationsErrors = validationResult(req).errors

    if (validationsErrors.length) {
      return res.status(422).render('user-things/edit', {
        thing: { ...req.body, ...req.params },
        errors: validationsErrors
      })
    }

    await thingModel.update({
      account_id: res.locals.authenticated_user.account_id,
      thing_id: req.params.thing_id,
      data: {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type
      }
    })
    req.log.info(`thing ${req.params.thing_id} updated by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect(`../things/${req.params.thing_id}/edit`)
  } catch (error) { next(error) }
})

router.delete('/:thing_id', async (req, res, next) => {
  try {
    await thingModel.delete({
      account_id: res.locals.authenticated_user.account_id,
      thing_id: req.params.thing_id
    })
    req.log.info(`thing ${req.params.thing_id} deleted by user ${res.locals.authenticated_user.user_id}`)

    return res.redirect('../things')
  } catch (error) { next(error) }
})

module.exports = router
