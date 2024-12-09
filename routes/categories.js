'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function categoryRoutes (fastify) {
  fastify.post('/category', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { name } = request.body;
    try {
      const newCategory = await prisma.category.create({
        data: { name },
      });
      reply.send(newCategory);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create category' });
    }
  });

  fastify.get('/categories', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const categories = await prisma.category.findMany();
      reply.send(categories);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch categories' });
    }
  });

  fastify.get('/category/:categoryId',
    {
      preHandler: [fastify.authenticate],
    }, async (request, reply) => {
      const { categoryId } = request.params;
      try {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        if (!category) {
          return reply.status(404).send({ error: 'Category not found' });
        }
        reply.send(category);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch category' });
      }
    });

  fastify.delete('/category/:categoryId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { categoryId } = request.params;
    try {
      const category = await prisma.category.delete({
        where: { id: categoryId },
      });
      reply.send({ message: 'Category deleted', category });
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Category not found' });
      }
      reply.status(500).send({ error: 'Failed to delete category' });
    }
  });
}

module.exports = categoryRoutes;