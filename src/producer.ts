import {
    Kafka,
    Message,
    Producer as KafkaProducer,
    ProducerBatch,
    TopicMessages,
} from 'kafkajs';

export class Producer {
    private producer: KafkaProducer;
    private clientId: string;
    private brokers: string[];
    private topic: string;

    constructor(clientId: string, brokers: string[], topic: string) {
        this.clientId = clientId;
        this.brokers = brokers;
        this.topic = topic;
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

    // public async sendBatch(messages: Array<Message>): Promise<void> {
    //     const topicMessages: TopicMessages = {
    //         topic: this.topic,
    //         messages,
    //     };

    //     const batch: ProducerBatch = {
    //         topicMessages: [topicMessages],
    //     };

    //     await this.producer.sendBatch(batch);
    // }

    public async sendMessage(message: Message): Promise<void> {
        await this.producer.send({
            topic: this.topic,
            messages: [message],
        });
    }

    private createProducer(): KafkaProducer {
        const kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers,
        });

        return kafka.producer();
    }
}
