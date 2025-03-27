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
}

export interface ConsumerInterface {
    start(): Promise<void>;
    shutdown(): Promise<void>;
}

export class Consumer {
    private kafkaConsumer: KafkaConsumer;
    private config: ConsumerClientConfig;
    private onMessageHandlers: ((
        messagePayload: EachMessagePayload
    ) => Promise<void>)[] = [];

    public constructor(config: ConsumerClientConfig) {
        this.config = config;
        this.kafkaConsumer = this.createKafkaConsumer();
    }

    public async start(): Promise<void> {
        const topic: ConsumerSubscribeTopics =
            this.config.consumerSubscribeTopics;
        await this.kafkaConsumer.connect();
        await this.kafkaConsumer.subscribe(topic);
        await this.kafkaConsumer.run({
            eachMessage: this.onMessage.bind(this),
        });
    }

    public async onMessage(messagePayload: EachMessagePayload) {
        this.onMessageHandlers.forEach((handler) => {
            handler(messagePayload);
        });
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect();
    }

    public addOnMessageHandler(
        handler: (messagePayload: EachMessagePayload) => Promise<void>
    ) {
        this.onMessageHandlers.push(handler);
    }

    private createKafkaConsumer(): KafkaConsumer {
        const kafka = new Kafka(this.config.kafkaConfig);
        const consumer = kafka.consumer(this.config.consumerConfig);
        return consumer;
    }
}
