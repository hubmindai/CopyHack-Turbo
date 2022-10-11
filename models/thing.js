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
    .from('thing')
    .insert(args)
    .returning('thing_id')
}

exports.update = async (args) => {
  return await dbService.instance
    .from('thing')
    .update(args.data)
    .where('account_id', args.account_id)
    .andWhere('thing_id', args.thing_id)
}

exports.delete = async (args) => {
  return await dbService.instance
    .from('thing')
    .update('is_deleted', true)
    .where('account_id', args.account_id)
    .andWhere('thing_id', args.thing_id)
}

exports.getActive = async (args) => {
  return await dbService.instance
    .select()
    .from('thing')
    .where('account_id', args.account_id)
    .andWhere('is_deleted', false)
    .limit(10)
    .offset(args.offset || 0)
}

exports.getByID = async (args) => {
  return await dbService.instance
    .select()
    .from('thing')
    .where('account_id', args.account_id)
    .andWhere('thing_id', args.thing_id)
    .andWhere('is_deleted', false)
}
