const faker = require('faker')

exports.seed = function (knex) {
  return knex('account').del()
    .then(function () {
      return knex('account').insert([
        {
          account_id: 100,
          name: faker.company.companyName(),
          current_feature_tier: 'FREE'
        },
        {
          account_id: 200,
          name: faker.company.companyName(),
          current_feature_tier: 'FREE'
        },
        {
          account_id: 300,
          name: faker.company.companyName(),
          current_feature_tier: 'FREE'
        }
      ])
    })
}
