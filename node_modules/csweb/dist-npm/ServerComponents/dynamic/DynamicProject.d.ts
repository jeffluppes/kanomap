import express = require('express');
import ClientConnection = require('./ClientConnection');
import MessageBus = require('../bus/MessageBus');
export declare class DynamicProject {
    folder: string;
    id: any;
    service: DynamicProjectService;
    messageBus: MessageBus.MessageBusService;
    project: any;
    constructor(folder: string, id: any, service: DynamicProjectService, messageBus: MessageBus.MessageBusService);
    Start(): void;
    AddLayer(data: any): void;
    private splitJson(data);
    openFile(): void;
    watchFolder(): void;
    removeLayer(file: string): void;
    addLayer(file: string): void;
    GetLayer(req: express.Request, res: express.Response): void;
}
export declare class DynamicProjectService {
    server: express.Express;
    connection: ClientConnection.ConnectionManager;
    messageBus: MessageBus.MessageBusService;
    test: string;
    projects: {
        [key: string]: DynamicProject;
    };
    projectParameters: {
        [key: string]: any;
    };
    constructor(server: express.Express, connection: ClientConnection.ConnectionManager, messageBus: MessageBus.MessageBusService);
    Start(server: express.Express): void;
}
