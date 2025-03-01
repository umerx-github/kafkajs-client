import {
    Kafka,
    Consumer as KafkaConsumer,
    ConsumerSubscribeTopics,
    EachMessagePayload,
} from 'kafkajs';

interface ConsumerConfig {
    clientId: string;
    brokers: string[];
    groupId: string;
    topics: string[];
    fromBeginning?: boolean;
    handler: (messagePayload: EachMessagePayload) => Promise<void>;
}

export class Consumer {
    private kafkaConsumer: KafkaConsumer;
    private config: ConsumerConfig;

    public constructor(config: ConsumerConfig) {
        this.config = {
            ...config,
            fromBeginning: config.fromBeginning ?? false,
        };
        this.kafkaConsumer = this.createKafkaConsumer();
    }

    public async subscribe(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: this.config.topics,
            fromBeginning: this.config.fromBeginning,
        };

        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);

            await this.kafkaConsumer.run({
                eachMessage: this.config.handler,
            });
        } catch (error) {
            console.log('Error: ', error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect();
    }

    private createKafkaConsumer(): KafkaConsumer {
        const kafka = new Kafka({
            clientId: this.config.clientId,
            brokers: this.config.brokers,
        });
        const consumer = kafka.consumer({ groupId: this.config.groupId });
        return consumer;
    }
}
