'use strict';

const { records } = require('../data');
let { recordId } = require('../data');

async function recordRoutes(fastify) {
  fastify.post('/record', (request, reply) => {
    const { userId, categoryId, amount } = request.body;
    const newRecord = { id: recordId++, userId, categoryId, dateTime: new Date(), amount };
    records.push(newRecord);
    reply.send(newRecord);
  });

  fastify.get('/record/:recordId', (request, reply) => {
    const record = records.find((r) => r.id === parseInt(request.params.recordId));
    record ? reply.send(record) : reply.status(404).send({ error: 'Record not found' });
  });

  fastify.delete('/record/:recordId', (request, reply) => {
    const recordIndex = records.findIndex((r) => r.id === parseInt(request.params.recordId));
    if (recordIndex === -1) {
      reply.status(404).send({ error: 'Record not found' });
    } else {
      records.splice(recordIndex, 1);
      reply.send({ message: 'Record deleted' });
    }
  });

  fastify.get('/record', (request, reply) => {
    const { userId, categoryId } = request.query;
    if (!userId && !categoryId) return reply.status(400).send({ error: 'user_id or category_id parameter is required' });

    let filteredRecords = records;
    if (userId) filteredRecords = filteredRecords.filter((r) => r.userId === parseInt(userId));
    if (categoryId) filteredRecords = filteredRecords.filter((r) => r.categoryId === parseInt(categoryId));

    reply.send(filteredRecords);
  });
}

module.exports = recordRoutes;