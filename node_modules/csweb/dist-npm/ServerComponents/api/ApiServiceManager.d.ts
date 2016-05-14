import express = require('express');
import ConfigurationService = require('../configuration/ConfigurationService');
import IApiService = require('./IApiService');
import IApiServiceManager = require('./IApiServiceManager');
declare class ApiServiceManager implements IApiServiceManager {
    private server;
    private config;
    private baseUrl;
    private dataUrl;
    private apiServices;
    constructor(server: express.Express, config: ConfigurationService.ConfigurationService);
    BaseUrl: string;
    DataUrl: string;
    addService(service: IApiService): string;
    findServiceById(serviceId: string): IApiService;
    removeService(serviceId: string): void;
}
export = ApiServiceManager;
