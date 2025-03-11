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
        const sendPromises = this.config.topics.map(async (topic) => {
            try {
                await this.kafkaProducer.send({
                    topic,
                    messages: [message],
                });
                console.log('Message sent to topic: ', topic);
            } catch (error) {
                console.log('Error sending message: ', error);
            }
        });

        await Promise.all(sendPromises);
    }
}
