
exports.up = function (knex) {
  return knex.schema.createTable('account', (table) => {
    table.bigIncrements('account_id').primary()
    table.text('name').notNullable()
    table.text('stripe_customer_id')
    table.text('current_feature_tier').notNullable()
    table.boolean('is_deleted').notNullable().defaultTo(false)
    table.timestamp('created_datetime', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('account')
}
