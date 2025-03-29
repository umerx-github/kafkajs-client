import { EachMessagePayload } from 'kafkajs';
import { Consumer as KafkaConsumer } from 'kafkajs';
import { off } from 'process';

export class Message {
    private message: EachMessagePayload;
    private kafkaConsumer: KafkaConsumer;

    constructor(message: EachMessagePayload, kafkaConsumer: KafkaConsumer) {
        this.message = message;
        this.kafkaConsumer = kafkaConsumer;
    }

    public get key(): Buffer | null {
        return this.message.message.key;
    }

    public get value(): Buffer | null {
        return this.message.message.value;
    }

    public get offset(): number {
        return parseInt(this.message.message.offset, 10);
    }

    public commit() {
        return this.kafkaConsumer.commitOffsets([
            {
                offset: this.message.message.offset,
                topic: this.message.topic,
                partition: this.message.partition,
            },
        ]);
    }
}
