'use strict';

const { users } = require('../data');
let { userId } = require('../data');

async function userRoutes(fastify) {
  fastify.post('/user', (request, reply) => {
    const { name } = request.body;
    const newUser = { id: userId++, name };
    users.push(newUser);
    reply.send(newUser);
  });

  fastify.get('/user/:userId', (request, reply) => {
    const user = users.find((u) => u.id === parseInt(request.params.userId));
    user ? reply.send(user) : reply.status(404).send({ error: 'User not found' });
  });

  fastify.delete('/user/:userId', (request, reply) => {
    const userIndex = users.findIndex((u) => u.id === parseInt(request.params.userId));
    if (userIndex === -1) {
      reply.status(404).send({ error: 'User not found' });
    } else {
      users.splice(userIndex, 1);
      reply.send({ message: 'User deleted' });
    }
  });

  fastify.get('/users', (request, reply) => {
    reply.send(users);
  });
}

module.exports = userRoutes;