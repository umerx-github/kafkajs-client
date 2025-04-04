import {
    Kafka,
    Consumer as KafkaConsumer,
    ConsumerSubscribeTopics,
    EachMessagePayload,
    KafkaConfig,
    ConsumerConfig,
} from 'kafkajs';
import { ConsumableMessage, Startable, SubscribableCommitable } from './interfaces.js';
import { Message as MessageConcrete } from './message.js';

interface ConsumerClientConfig {
    kafkaConfig: KafkaConfig;
    consumerConfig: ConsumerConfig;
    consumerSubscribeTopics: ConsumerSubscribeTopics;
}

export class Consumer implements Startable, SubscribableCommitable {
    private kafkaConsumer: KafkaConsumer;
    private config: ConsumerClientConfig;
    private onMessageHandlers: ((message: ConsumableMessage) => Promise<void>)[] = [];

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
        const message = new MessageConcrete(messagePayload, this.kafkaConsumer);
        this.onMessageHandlers.forEach((handler) => {
            handler(message);
        });
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect();
    }

    public addOnMessageHandler(handler: (message: ConsumableMessage) => Promise<void>) {
        this.onMessageHandlers.push(handler);
    }

    private createKafkaConsumer(): KafkaConsumer {
        const kafka = new Kafka(this.config.kafkaConfig);
        const consumer = kafka.consumer(this.config.consumerConfig);
        return consumer;
    }
}
