export interface Startable {
    start(): Promise<void>;
    shutdown(): Promise<void>;
}

export interface SubscribableCommitable {
    addOnMessageHandler(handler: (message: ConsumableMessage) => Promise<void>): void;
}

export interface Broadcastable {
    sendMessage(message: ConsumableMessage): Promise<void>;
}

export interface Storable<V = any, K extends Key = Key> {
    get(id: K): Promise<V | undefined>;
    put(id: K, value: V): Promise<boolean>;
}

export type Key = Key[] | string | symbol | number | boolean | Uint8Array;

export interface ProducableMessage {
    key?: Buffer | string | null;
    value: Buffer | string | null;
}

export interface ConsumableMessage {
    key?: Buffer | string | null;
    value: Buffer | string | null;
    offset: number;
    commit(): Promise<void>;
}



