'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function currencyRoutes (fastify) {
  fastify.post('/currency', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { name } = request.body;

    try {
      const existingCurrency = await prisma.currency.findFirst({
        where: { name: name.toUpperCase() },
      });

      if (existingCurrency) {
        return reply.status(400).send({ error: `Currency with name "${ name }" already exists` });
      }

      const newCurrency = await prisma.currency.create({
        data: {
          name: name.toUpperCase(),
        },
      });

      reply.send(newCurrency);
    } catch (error) {
      console.error('Error creating currency:', error);
      reply.status(500).send({ error: 'Failed to create currency' });
    }
  });
}

module.exports = currencyRoutes;