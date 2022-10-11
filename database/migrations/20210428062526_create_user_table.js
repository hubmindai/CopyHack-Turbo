
exports.up = function (knex) {
  return knex.schema.createTable('user', (table) => {
    table.bigIncrements('user_id').primary()
    table.bigInteger('account_id').notNullable()
    table.text('name').notNullable()
    table.text('email').notNullable()
    table.text('phone')
    table.boolean('is_deleted').notNullable().defaultTo(false)
    table.text('account_role').notNullable().defaultTo('OWNER')
    table.boolean('is_system_admin').notNullable().defaultTo(false)
    table.text('time_zone').notNullable().defaultTo('UTC')
    table.text('date_format').notNullable().defaultTo('MM-DD-YYYY')
    table.text('time_format').notNullable().defaultTo('12_HOUR')
    table.bigInteger('impersonated_user_id')
    table.timestamp('created_datetime', { useTz: false }).notNullable().defaultTo(knex.fn.now())
    table.unique('email')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user')
}
