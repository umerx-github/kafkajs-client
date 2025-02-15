// Get ENV/ variable named "KAFKA_POSITION"
// import ExampleConsumer from './consumer.js';
// import ProducerFactory from './producer.js';
const kafkaPosition = process.env.KAFKA_POSITION;
if (!kafkaPosition) {
    throw new Error('KAFKA_POSITION is not defined');
}
console.log('KAFKA_POSITION: ', kafkaPosition);
if (kafkaPosition === 'producer') {
    console.log('Starting producer');
    import('./producer.js').then(async (module) => {
        const producer = new module.default();
        await producer.start();
        while (true) {
            const random = Math.floor(Math.random() * 100);
            const message = { a: `test-${random}` };
            console.log('Sending message: ', JSON.stringify(message));
            producer.sendBatch([message]);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    });
} else if (kafkaPosition === 'consumer') {
    console.log('Starting consumer');
    import('./consumer.js').then((module) => {
        const consumer = new module.default();
        consumer.startConsumer();
    });
}
