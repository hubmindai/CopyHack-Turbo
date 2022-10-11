
exports.up = function (knex) {
  return knex.schema.createTable('thing', (table) => {
    table.bigIncrements('thing_id').primary()
    table.bigInteger('account_id').notNullable()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.text('type').notNullable()
    table.boolean('is_deleted').notNullable().defaultTo(false)
    table.timestamp('created_datetime', { useTz: false }).notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('thing')
}
