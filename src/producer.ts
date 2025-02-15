import {
    Kafka,
    Message,
    Producer,
    ProducerBatch,
    TopicMessages,
} from 'kafkajs';

export default class ProducerFactory {
    private producer: Producer;

    constructor() {
        this.producer = this.createProducer();
    }

    public async start(): Promise<void> {
        try {
            console.log('Connecting producer');
            await this.producer.connect();
            console.log('Producer connected');
        } catch (error) {
            console.log('Error connecting the producer: ', error);
        }
    }

    public async shutdown(): Promise<void> {
        await this.producer.disconnect();
    }

    public async sendBatch(messages: Array<Message>): Promise<void> {
        const topicMessages: TopicMessages = {
            topic: 'testing',
            messages,
        };

        const batch: ProducerBatch = {
            topicMessages: [topicMessages],
        };

        await this.producer.sendBatch(batch);
    }

    private createProducer(): Producer {
        const kafka = new Kafka({
            clientId: 'client-id',
            brokers: ['broker:9092'],
        });

        return kafka.producer();
    }
}
