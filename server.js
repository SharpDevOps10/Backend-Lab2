'use strict';

const fastify = require('fastify')({ logger: false });

fastify.register(require('./routes/users'));
fastify.register(require('./routes/categories'));
fastify.register(require('./routes/records'));

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://0.0.0.0:3000');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();