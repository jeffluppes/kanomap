import express = require('express');
import IApiService = require('../api/IApiService');
import IApiServiceManager = require('../api/IApiServiceManager');
import ConfigurationService = require('../configuration/ConfigurationService');
declare class ProxyService implements IApiService {
    private server;
    private config;
    private baseUrl;
    id: string;
    init(apiServiceManager: IApiServiceManager, server: express.Express, config: ConfigurationService.ConfigurationService): void;
    shutdown(): void;
    private getUrl(feedUrl, res);
}
export = ProxyService;
