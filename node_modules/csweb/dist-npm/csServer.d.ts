import express = require('express');
import csweb = require('./index');
export declare class csServerOptions {
    port: number;
}
export declare class csServer {
    dir: string;
    options: csServerOptions;
    server: express.Express;
    cm: csweb.ConnectionManager;
    messageBus: csweb.MessageBusService;
    httpServer: any;
    config: csweb.ConfigurationService;
    api: csweb.ApiManager;
    constructor(dir: string, options?: csServerOptions);
    start(started: Function): void;
}
