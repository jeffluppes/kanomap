import MessageBus = require("../bus/MessageBus");
import ApiManager = require('../api/ApiManager');
import ApiMeta = ApiManager.ApiMeta;
export declare class MsgSubscription {
    id: string;
    type: string;
    target: string;
    regexPattern: RegExp;
    callback: Function;
}
export declare class ProjectSubscription {
    projectId: string;
    callback: MessageBus.IMessageBusCallback;
}
export declare class LayerSubscription {
    layerId: string;
    callback: MessageBus.IMessageBusCallback;
}
export declare class KeySubscription {
    keyId: string;
    callback: MessageBus.IMessageBusCallback;
}
export declare class ProjectUpdate {
    projectId: string;
    action: ProjectUpdateAction;
    item: any;
}
export declare class LayerUpdate {
    layerId: string;
    action: LayerUpdateAction;
    item: any;
    featureId: string;
}
export declare class KeyUpdate {
    keyId: string;
    action: KeyUpdateAction;
    item: any;
}
export declare enum ProjectUpdateAction {
    updateProject = 0,
    deleteProject = 1,
}
export declare enum LayerUpdateAction {
    updateFeature = 0,
    updateLog = 1,
    deleteFeature = 2,
    updateLayer = 3,
    deleteLayer = 4,
}
export declare enum KeyUpdateAction {
    updateKey = 0,
    deleteKey = 1,
}
export declare class ClientMessage {
    action: string;
    data: any;
    constructor(action: string, data: any);
}
export declare class WebClient {
    Client: any;
    Name: string;
    Subscriptions: {
        [key: string]: MsgSubscription;
    };
    constructor(Client: any);
    FindSubscription(target: string, type: string): MsgSubscription;
    Subscribe(sub: MsgSubscription): void;
}
export declare class ConnectionManager {
    private users;
    server: SocketIO.Server;
    msgSubscriptions: MsgSubscription[];
    constructor(httpServer: any);
    checkClientMessage(msg: ClientMessage, client: string): void;
    registerProject(projectId: string, callback: MessageBus.IMessageBusCallback): void;
    registerLayer(layerId: string, callback: MessageBus.IMessageBusCallback): void;
    subscribe(on: string, callback: Function): void;
    updateSensorValue(sensor: string, date: number, value: number): void;
    publish(key: string, type: string, command: string, object: any): void;
    updateDirectory(layer: string): void;
    updateProject(projectId: string, update: ProjectUpdate, meta: ApiMeta): void;
    updateFeature(layerId: string, update: LayerUpdate, meta: ApiMeta): void;
    updateLayer(layerId: string, update: LayerUpdate, meta: ApiMeta): void;
    updateKey(keyId: string, update: KeyUpdate, meta: ApiMeta): void;
}
