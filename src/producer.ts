import {
    Kafka,
    Message,
    Producer as KafkaProducer,
    KafkaConfig,
    ProducerConfig,
} from 'kafkajs';

interface ProducerClientConfig {
    kafkaConfig: KafkaConfig;
    producerConfig: ProducerConfig;
    topics: string[];
}

export interface ProducerInterface {
    start(): Promise<void>;
    shutdown(): Promise<void>;
    sendMessage(message: Message): Promise<void>;
}

export class Producer {
    private kafkaProducer: KafkaProducer;
    private config: ProducerClientConfig;

    public constructor(config: ProducerClientConfig) {
        this.config = config;
        this.kafkaProducer = this.createProducer();
    }

    private createProducer(): KafkaProducer {
        const kafka = new Kafka(this.config.kafkaConfig);

        return kafka.producer(this.config.producerConfig);
    }

    public async start(): Promise<void> {
        await this.kafkaProducer.connect();
    }

    public async shutdown(): Promise<void> {
        await this.kafkaProducer.disconnect();
    }

    public async sendMessage(message: Message): Promise<void> {
        const sendPromises = this.config.topics.map(async (topic) => {
            await this.kafkaProducer.send({
                topic,
                messages: [message],
            });
        });

        await Promise.all(sendPromises);
    }
}
