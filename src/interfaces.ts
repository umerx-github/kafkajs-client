export interface ConsumerInterface {
    start(): Promise<void>;
    shutdown(): Promise<void>;
}

export interface DatabaseLike<V = any, K extends Key = Key> {
    get(id: K): Promise<V | undefined>;
    put(id: K, value: V): Promise<boolean>;
}

type Key = Key[] | string | symbol | number | boolean | Uint8Array;

export interface Message {
    key?: Buffer | string | null;
    value: Buffer | string | null;
    offset: number;
    commit(): Promise<void>;
}

export interface ProducerInterface {
    start(): Promise<void>;
    shutdown(): Promise<void>;
    sendMessage(message: Message): Promise<void>;
}
