'use strict'

//
//
// Imports
// ############################################
const dbService = require('../services/database')

//
//
// Methods
// ############################################
exports.create = async (args) => {
  return await dbService.instance
    .from('user')
    .insert(args)
    .returning('user_id')
}

exports.update = async (args) => {
  return await dbService.instance
    .from('user')
    .update(args.data)
    .where('user_id', args.user_id)
    .returning('user_id')
}

exports.delete = async (args) => {
  return await dbService.instance
    .from('user')
    .update('is_deleted', true)
    .where('user_id', args.user_id)
}

exports.getByID = async (args) => {
  return await dbService.instance
    .select()
    .from('user')
    .where('user_id', args.user_id)
    .andWhere('is_deleted', false)
}

exports.getByEmail = async (args) => {
  return await dbService.instance
    .select()
    .from('user')
    .where('email', args.email)
    .andWhere('is_deleted', false)
}

exports.getActive = async (args) => {
  return await dbService.instance
    .select()
    .from('user')
    .andWhere('is_deleted', false)
    .limit(10)
    .offset(args.offset || 0)
}

exports.getActiveByAccountID = async (args) => {
  return await dbService.instance
    .select()
    .from('user')
    .where('account_id', args.account_id)
    .andWhere('is_deleted', false)
    .limit(10)
    .offset(args.offset || 0)
}
