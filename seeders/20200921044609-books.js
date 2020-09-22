'use strict';
const faker = require('faker');
const books = [...Array(500)].map((book) => ({
  author: `${faker.name.firstName()} ${faker.name.lastName()}`,
  title: faker.random.words(Math.floor(Math.random() * 5 + 2)),
  genre: faker.random.word(1),
  year: Math.floor(Math.random() * 70) + 1950,
  createdAt: new Date(),
  updatedAt: new Date()
  }
));

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.bulkInsert('Books', books, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('Books', null, {});
  }
};
