
exports.up = function (knex) {
  return knex.schema.createTable('authentication_request', (table) => {
    table.bigIncrements('authentication_request_id').primary()
    table.text('verification_code').notNullable()
    table.text('session_token').notNullable()
    table.text('email').notNullable()
    table.timestamp('created_datetime', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.unique('session_token')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('thing')
}
