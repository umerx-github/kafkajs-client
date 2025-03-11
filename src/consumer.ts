import {
    Kafka,
    Consumer as KafkaConsumer,
    ConsumerSubscribeTopics,
    EachMessagePayload,
    KafkaConfig,
    ConsumerConfig,
} from 'kafkajs';

interface ConsumerClientConfig {
    kafkaConfig: KafkaConfig;
    consumerConfig: ConsumerConfig;
    consumerSubscribeTopics: ConsumerSubscribeTopics;
    onMessage: (messagePayload: EachMessagePayload) => Promise<void>;
}

export class Consumer {
    private kafkaConsumer: KafkaConsumer;
    private config: ConsumerClientConfig;

    public constructor(config: ConsumerClientConfig) {
        this.config = config;
        this.kafkaConsumer = this.createKafkaConsumer();
    }

    public async start(): Promise<void> {
        const topic: ConsumerSubscribeTopics =
            this.config.consumerSubscribeTopics;
        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);

            await this.kafkaConsumer.run({
                eachMessage: this.config.onMessage,
            });
        } catch (error) {
            console.log('Error: ', error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect();
    }

    private createKafkaConsumer(): KafkaConsumer {
        const kafka = new Kafka(this.config.kafkaConfig);
        const consumer = kafka.consumer(this.config.consumerConfig);
        return consumer;
    }
}
