'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function authRoutes (fastify) {
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          password: { type: 'string', minLength: 6 },
          currencyId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { name, password, currencyId } = request.body;

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

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          password: hashedPassword,
          currencyId: selectedCurrency.id,
        },
      });

      reply.send({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      console.error('Error creating user:', error);
      reply.status(500).send({ error: 'Failed to register user' });
    }
  });
}

module.exports = authRoutes;