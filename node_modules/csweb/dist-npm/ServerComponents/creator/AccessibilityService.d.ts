import express = require('express');
import IApiService = require('../api/IApiService');
import IApiServiceManager = require('../api/IApiServiceManager');
import ConfigurationService = require('../configuration/ConfigurationService');
export declare class AccessibilityService implements IApiService {
    private server;
    private config;
    private baseUrl;
    id: string;
    init(apiServiceManager: IApiServiceManager, server: express.Express, config: ConfigurationService.ConfigurationService): void;
    shutdown(): void;
    private getAccessibility(url, res);
}
