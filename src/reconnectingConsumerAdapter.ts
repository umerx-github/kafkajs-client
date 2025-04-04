import { ConsumableMessage, Startable, SubscribableCommitable } from "./interfaces.js";

interface ConsumerLike extends Startable, SubscribableCommitable {}

interface ReconnectingConsumerAdapterProps {
    consumer: ConsumerLike;
    delay?: number;
}

export class ReconnectingConsumerAdapter {
    private consumer: ConsumerLike;
    private delay: number;
    private connecting: boolean;

    constructor({ consumer, delay = 1000 }: ReconnectingConsumerAdapterProps) {
        this.consumer = consumer;
        this.delay = delay;
        this.connecting = false;
        this.connect();
    }

    public async addOnMessageHandler(
        handler: (message: ConsumableMessage) => Promise<void>
    ): Promise<void> {
        this.consumer.addOnMessageHandler(handler);
    }

    private connect() {
        if (this.connecting) {
            return;
        }
        this.connecting = true;
        setTimeout(async () => {
            try {
                await this.consumer.shutdown();
                await this.consumer.start();
            } catch (e) {
                this.connecting = false;
                this.connect();
            }
            this.connecting = false;
        }, this.delay);
    }
}
