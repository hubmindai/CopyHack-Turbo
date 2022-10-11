const faker = require('faker')

exports.seed = function (knex) {
  return knex('user').del()
    .then(function () {
      return knex('user').insert([
        {
          account_id: 100,
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber(),
          is_system_admin: true
        },
        {
          account_id: 100,
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber()
        },
        {
          account_id: 200,
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber()
        },
        {
          account_id: 200,
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber()
        },
        {
          account_id: 300,
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber()
        },
        {
          account_id: 300,
          name: faker.name.firstName() + ' ' + faker.name.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.phoneNumber()
        }
      ])
    })
}
