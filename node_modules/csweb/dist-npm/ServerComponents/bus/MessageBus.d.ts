export interface IMessageBusCallback {
    (title: string, data?: any, sender?: string): any;
}
export declare class MessageBusHandle {
    constructor(topic: string, callback: IMessageBusCallback);
    topic: string;
    callback: IMessageBusCallback;
}
export declare class MessageBusService {
    private static cache;
    publish(topic: string, title: string, data?: any): void;
    subscribe(topic: string, callback: IMessageBusCallback): MessageBusHandle;
    unsubscribe(handle: MessageBusHandle): void;
}
