'use strict';

const { categories } = require('../data');
let { categoryId } = require('../data');

async function categoryRoutes(fastify) {
  fastify.post('/category', (request, reply) => {
    const { name } = request.body;
    const newCategory = { id: categoryId++, name };
    categories.push(newCategory);
    reply.send(newCategory);
  });

  fastify.get('/categories', (request, reply) => {
    reply.send(categories);
  });

  fastify.get('/category/:categoryId', (request, reply) => {
    const category = categories.find((c) => c.id === parseInt(request.params.categoryId));
    category ? reply.send(category) : reply.status(404).send({ error: 'Category not found' });
  });

  fastify.delete('/category/:categoryId', (request, reply) => {
    const categoryIndex = categories.findIndex((c) => c.id === parseInt(request.params.categoryId));
    if (categoryIndex === -1) {
      reply.status(404).send({ error: 'Category not found' });
    } else {
      categories.splice(categoryIndex, 1);
      reply.send({ message: 'Category deleted' });
    }
  });
}

module.exports = categoryRoutes;