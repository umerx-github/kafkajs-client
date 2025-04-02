import { Message } from './interfaces.js';
import { DatabaseLike } from './interfaces.js';

interface ConsumerLike {
    addOnMessageHandler(handler: (message: Message) => Promise<void>): void;
}

export class IdempotentConsumerAdapter {
    private consumer: ConsumerLike;
    private db: DatabaseLike<number, string>;
    private lastProcessed: number | null;
    private onMessageHandlers: ((message: Message) => Promise<void>)[] = [];
    private flushing: boolean = false;
    private messageQueue: Message[] = [];

    constructor(consumer: ConsumerLike, db: DatabaseLike<number, string>) {
        this.consumer = consumer;
        this.db = db;
        this.lastProcessed = null;
        this.consumer.addOnMessageHandler((message) => this.onMessage(message));
    }

    private async getLastProcessed() {
        if (this.lastProcessed !== null) {
            return this.lastProcessed;
        }
        let lastProcessedRaw = await this.db.get('lastProcessed');
        if (lastProcessedRaw === undefined) {
            lastProcessedRaw = -1;
        }
        this.lastProcessed = lastProcessedRaw;
        return this.lastProcessed;
    }

    private async onMessage(message: Message): Promise<void> {
        this.messageQueue.push(message);
        this.flush();
    }

    private async flush() {
        if (this.flushing) {
            return;
        }
        this.flushing = true;
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message !== undefined) {
                try {
                    await this.processMessage(message);
                } catch (e) {
                    console.error('Error processing message:', e);
                    // this.flushing = false;
                    // break;
                }
            }
        }
        this.flushing = false;
    }

    private async processMessage(message: Message): Promise<void> {
        let lastProcessed = await this.getLastProcessed();
        if (message.offset <= lastProcessed) {
            message.commit();
            return;
        }
        try {
            await Promise.all(
                this.onMessageHandlers.map((handler) => handler(message))
            );
            // Store the offset in memory
            this.lastProcessed = message.offset;
            // Store the offset on disk
            await this.db.put('lastProcessed', this.lastProcessed);
            // Then, commit the message so pub/sub knows
            message.commit();
        } catch (error) {
            throw error;
        }
    }

    public async addOnMessageHandler(
        handler: (message: Message) => Promise<void>
    ): Promise<void> {
        this.onMessageHandlers.push(handler);
    }
}
