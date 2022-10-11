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
    .from('account')
    .insert(args)
    .returning('account_id')
}

exports.update = async (args) => {
  return await dbService.instance
    .from('account')
    .update(args.data)
    .where('account_id', args.account_id)
}

exports.delete = async (args) => {
  return await dbService.instance
    .from('account')
    .update('is_deleted', true)
    .where('account_id', args.account_id)
}

exports.getByID = async (args) => {
  return await dbService.instance
    .select()
    .from('account')
    .where('account_id', args.account_id)
    .andWhere('is_deleted', false)
}

exports.getActive = async (args) => {
  return await dbService.instance
    .select()
    .from('account')
    .andWhere('is_deleted', false)
    .limit(10)
    .offset(args.offset || 0)
}
