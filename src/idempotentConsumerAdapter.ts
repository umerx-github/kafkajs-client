import { ConsumableMessage, SubscribableCommitable, Storable } from './interfaces.js';

export class IdempotentConsumerAdapter implements SubscribableCommitable {
    private consumer: SubscribableCommitable;
    private db: Storable<number, string>;
    private lastProcessed: number | null;
    private onMessageHandlers: ((message: ConsumableMessage) => Promise<void>)[] = [];
    private flushing: boolean = false;
    private messageQueue: ConsumableMessage[] = [];

    constructor(consumer: SubscribableCommitable, db: Storable<number, string>) {
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

    private async onMessage(message: ConsumableMessage): Promise<void> {
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
                }
            }
        }
        this.flushing = false;
    }

    private async processMessage(message: ConsumableMessage): Promise<void> {
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
        handler: (message: ConsumableMessage) => Promise<void>
    ): Promise<void> {
        this.onMessageHandlers.push(handler);
    }
}
