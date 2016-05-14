import ApiManager = require('./ApiManager');
import express = require('express');
import BaseConnector = require('./BaseConnector');
export declare class RestAPI extends BaseConnector.BaseConnector {
    server: express.Express;
    baseUrl: string;
    manager: ApiManager.ApiManager;
    resourceUrl: any;
    layersUrl: any;
    keysUrl: any;
    filesUrl: any;
    searchUrl: any;
    projectsUrl: any;
    proxyUrl: any;
    constructor(server: express.Express, baseUrl?: string);
    init(layerManager: ApiManager.ApiManager, options: any, callback: Function): void;
    private getUrl(feedUrl, res);
}
