import { Kafka, Message, Producer as KafkaProducer } from 'kafkajs';

interface ProducerConfig {
    clientId: string;
    brokers: string[];
    topic: string;
    allowAutoTopicCreation?: boolean;
}

export class Producer {
    private kafkaProducer: KafkaProducer;
    private config: ProducerConfig;

    public constructor(config: ProducerConfig) {
        this.config = {
            ...config,
            allowAutoTopicCreation: config.allowAutoTopicCreation ?? false,
        };
        this.kafkaProducer = this.createProducer();
    }

    private createProducer(): KafkaProducer {
        const kafka = new Kafka({
            clientId: this.config.clientId,
            brokers: this.config.brokers,
        });

        return kafka.producer({
            allowAutoTopicCreation: this.config.allowAutoTopicCreation,
        });
    }

    public async start(): Promise<void> {
        try {
            console.log('Connecting producer');
            await this.kafkaProducer.connect();
            console.log('Producer connected');
        } catch (error) {
            console.log('Error connecting the producer: ', error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaProducer.disconnect();
    }

    public async sendMessage(message: Message): Promise<void> {
        await this.kafkaProducer.send({
            topic: this.config.topic,
            messages: [message],
        });
    }
}
