const faker = require('faker')

exports.seed = function (knex) {
  return knex('thing').del()
    .then(function () {
      return knex('thing').insert([
        {
          account_id: 100,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          type: 'LITE'
        },
        {
          account_id: 100,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          type: 'LITE'
        },
        {
          account_id: 200,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          type: 'LITE'
        },
        {
          account_id: 200,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          type: 'LITE'
        },
        {
          account_id: 300,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          type: 'LITE'
        },
        {
          account_id: 300,
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          type: 'LITE'
        }
      ])
    })
}
