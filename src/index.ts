import {
    Consumer,
    ConsumerSubscribeTopics,
    EachBatchPayload,
    Kafka,
    EachMessagePayload,
} from 'kafkajs';

export default class ExampleConsumer {
    private kafkaConsumer: Consumer;

    public constructor() {
        this.kafkaConsumer = this.createKafkaConsumer();
    }

    public async startConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: ['testing'],
            fromBeginning: false,
        };

        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);

            await this.kafkaConsumer.run({
                eachMessage: async (messagePayload: EachMessagePayload) => {
                    const { topic, partition, message } = messagePayload;
                    const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
                    console.log(`- ${prefix} ${message.key}#${message.value}`);
                },
            });
        } catch (error) {
            console.log('Error: ', error);
        }
    }

    public async startBatchConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: ['testing'],
            fromBeginning: false,
        };

        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);
            await this.kafkaConsumer.run({
                eachBatch: async (eachBatchPayload: EachBatchPayload) => {
                    const { batch } = eachBatchPayload;
                    for (const message of batch.messages) {
                        const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
                        console.log(
                            `- ${prefix} ${message.key}#${message.value}`
                        );
                    }
                },
            });
        } catch (error) {
            console.log('Error: ', error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect();
    }

    private createKafkaConsumer(): Consumer {
        const kafka = new Kafka({
            clientId: 'client-id',
            brokers: ['broker:9092'],
        });
        const consumer = kafka.consumer({ groupId: 'consumer-group' });
        return consumer;
    }
}

const consumer = new ExampleConsumer();
consumer.startConsumer();
