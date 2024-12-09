'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function userRoutes (fastify) {
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