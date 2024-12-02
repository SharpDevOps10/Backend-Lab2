'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function userRoutes (fastify) {
  fastify.post('/user', {
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          currencyId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { name, currencyId } = request.body;

    try {
      let selectedCurrency;

      if (currencyId) {
        selectedCurrency = await prisma.currency.findUnique({
          where: { id: currencyId },
        });

        if (!selectedCurrency) {
          return reply.status(400).send({ error: `Currency with id ${ currencyId } not found` });
        }
      }

      if (!selectedCurrency) {
        selectedCurrency = await prisma.currency.findFirst({
          where: { name: 'USD' },
        });

        if (!selectedCurrency) {
          selectedCurrency = await prisma.currency.create({
            data: { name: 'USD' },
          });
        }
      }

      const user = await prisma.user.create({
        data: {
          name,
          currencyId: selectedCurrency.id,
        },
      });

      reply.send(user);
    } catch (error) {
      console.error('Error creating user:', error);
      reply.status(500).send({ error: 'Failed to create user' });
    }
  });

  fastify.get('/user/:userId', async (request, reply) => {
    const { userId } = request.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { currency: true },
      });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      reply.send(user);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch user' });
    }
  });

  fastify.delete('/user/:userId', async (request, reply) => {
    const { userId } = request.params;
    try {
      const user = await prisma.user.delete({
        where: { id: userId },
      });
      reply.send({ message: 'User deleted', user });
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'User not found' });
      }
      reply.status(500).send({ error: 'Failed to delete user' });
    }
  });

  fastify.get('/users', async (request, reply) => {
    try {
      const users = await prisma.user.findMany();
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch users' });
    }
  });
}

module.exports = userRoutes;