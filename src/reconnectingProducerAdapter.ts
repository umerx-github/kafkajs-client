import { Producer } from "../index.js";
import { Broadcastable, ProducableMessage } from "./interfaces.js";

interface ReconnectingProducerAdapterProps {
    producer: Producer.Producer;
    delay?: number;
}

export class ReconnectingProducerAdapter implements Broadcastable {
    private messageQueue: ProducableMessage[];
    private producer: Producer.Producer;
    private flushable: boolean;
    private delay: number;
    private flushing: boolean;
    private makingFlushable: boolean;

    constructor({ producer, delay = 1000 }: ReconnectingProducerAdapterProps) {
        this.producer = producer;
        this.messageQueue = [];
        this.flushable = false;
        this.makingFlushable = false;
        this.flushing = false;
        this.delay = delay;
        this.makeFlushable();
    }

    private makeFlushable() {
        if (this.makingFlushable) {
            return;
        }
        this.makingFlushable = true;
        this.flushable = false;
        setTimeout(async () => {
            try {
                await this.producer.shutdown();
                await this.producer.start();
                this.flushable = true;
            } catch (e) {
                // pass
            }
            this.makingFlushable = false;
            this.flushIfFlushableElseMakeFlushable();
        }, this.delay);
    }

    private flushIfFlushableElseMakeFlushable() {
        if (this.flushable) {
            this.flush();
        } else {
            this.makeFlushable();
        }
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
                    await this.producer.sendMessage(message);
                } catch (e) {
                    this.flushing = false;
                    this.makeFlushable();
                    break;
                }
            }
        }
        this.flushing = false;
    }

    public async sendMessage(message: ProducableMessage) {
        this.messageQueue.push(message);
        this.flushIfFlushableElseMakeFlushable();
    }
}
