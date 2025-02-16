import {
    Consumer as KafkaConsumer,
    ConsumerSubscribeTopics,
    EachBatchPayload,
    Kafka,
    EachMessagePayload,
} from 'kafkajs';

export class Consumer {
    private kafkaConsumer: KafkaConsumer;
    private clientId: string;
    private brokers: string[];
    private groupId: string;
    private topics: string[];

    public constructor(
        clientId: string,
        brokers: string[],
        groupId: string,
        topics: string[]
    ) {
        this.clientId = clientId;
        this.brokers = brokers;
        this.groupId = groupId;
        this.topics = topics;
        this.kafkaConsumer = this.createKafkaConsumer();
    }

    public async startConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: this.topics,
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

    // public async startBatchConsumer(): Promise<void> {
    //     const topic: ConsumerSubscribeTopics = {
    //         topics: this.topics,
    //         fromBeginning: false,
    //     };

    //     try {
    //         await this.kafkaConsumer.connect();
    //         await this.kafkaConsumer.subscribe(topic);
    //         await this.kafkaConsumer.run({
    //             eachBatch: async (eachBatchPayload: EachBatchPayload) => {
    //                 const { batch } = eachBatchPayload;
    //                 for (const message of batch.messages) {
    //                     const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
    //                     console.log(
    //                         `- ${prefix} ${message.key}#${message.value}`
    //                     );
    //                 }
    //             },
    //         });
    //     } catch (error) {
    //         console.log('Error: ', error);
    //     }
    // }

    public async onMessage(
        handler: (messagePayload: EachMessagePayload) => Promise<void>
    ): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: this.topics,
            fromBeginning: false,
        };

        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe(topic);

            await this.kafkaConsumer.run({
                eachMessage: handler,
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
            clientId: this.clientId,
            brokers: this.brokers,
        });
        const consumer = kafka.consumer({ groupId: this.groupId });
        return consumer;
    }
}
