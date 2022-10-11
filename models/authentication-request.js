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
    .from('authentication_request')
    .insert(args)
    .returning('authentication_request_id')
}

exports.deleteExpired = async (args) => {
  return await dbService.instance
    .from('authentication_request')
    .where('created_datetime', '<', dbService.instance.raw('CURRENT_TIMESTAMP - (5 || \' minutes\')::interval'))
    .delete()
}

exports.getByVerificationCode = async (args) => {
  return await dbService.instance
    .select()
    .from('authentication_request')
    .where('verification_code', args.verification_code)
    .andWhere('session_token', args.session_token)
    .andWhere('created_datetime', '>', dbService.instance.raw('CURRENT_TIMESTAMP - (5 || \' minutes\')::interval'))
}
