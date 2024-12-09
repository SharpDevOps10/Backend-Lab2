'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function recordRoutes (fastify) {
  fastify.post('/record', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'categoryId', 'amount'],
        properties: {
          userId: { type: 'string' },
          categoryId: { type: 'string' },
          amount: { type: 'number' },
          currencyId: { type: 'string' },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { userId, categoryId, amount, currencyId } = request.body;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

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
        selectedCurrency = await prisma.currency.findUnique({
          where: { id: user.currencyId },
        });
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

      const newRecord = await prisma.record.create({
        data: {
          userId,
          categoryId,
          amount,
          currencyId: selectedCurrency.id,
        },
      });

      reply.send(newRecord);
    } catch (error) {
      console.error('Error creating record:', error);
      reply.status(500).send({ error: 'Failed to create record' });
    }
  });

  fastify.get('/record/:recordId', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { recordId } = request.params;
    try {
      const record = await prisma.record.findUnique({
        where: { id: recordId },
        include: { user: true, category: true, currency: true },
      });
      if (!record) {
        return reply.status(404).send({ error: 'Record not found' });
      }
      reply.send(record);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch record' });
    }
  });

  fastify.delete('/record/:recordId', {
      preHandler: [fastify.authenticate],
    }, async (request, reply) => {
    const { recordId } = request.params;
    try {
      const record = await prisma.record.delete({
        where: { id: recordId },
      });
      reply.send({ message: 'Record deleted', record });
    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({ error: 'Record not found' });
      }
      reply.status(500).send({ error: 'Failed to delete record' });
    }
  });

  fastify.get('/record', async (request, reply) => {
    const { userId, categoryId } = request.query;
    if (!userId && !categoryId) {
      return reply.status(400).send({ error: 'Either userId or categoryId must be provided' });
    }

    try {
      const records = await prisma.record.findMany({
        where: {
          userId: userId ? userId : undefined,
          categoryId: categoryId ? categoryId : undefined,
        },
        include: { user: true, category: true, currency: true },
      });
      reply.send(records);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch records' });
    }
  });
}

module.exports = recordRoutes;