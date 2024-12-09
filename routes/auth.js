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

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          password: { type: 'string', minLength: 6 },
        },
      },
    },
  }, async (request, reply) => {
    const { name, password } = request.body;

    try {
      const user = await prisma.user.findUnique({ where: { name } });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({ error: 'Invalid password' });
      }

      const token = fastify.jwt.sign({ userId: user.id, name: user.name });

      reply.send({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Failed to login' });
    }
  });
}

module.exports = authRoutes;