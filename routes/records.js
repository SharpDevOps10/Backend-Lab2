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
        },
      },
    },
  }, async (request, reply) => {
    const { userId, categoryId, amount, currencyId } = request.body;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const newRecord = await prisma.record.create({
        data: {
          userId,
          categoryId,
          amount,
          currencyId: currencyId || user.currencyId,
        },
      });

      reply.send(newRecord);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create record' });
    }
  });

  fastify.get('/record/:recordId', async (request, reply) => {
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

  fastify.delete('/record/:recordId', async (request, reply) => {
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