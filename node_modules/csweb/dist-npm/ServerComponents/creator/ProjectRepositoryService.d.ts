import express = require('express');
import IApiServiceManager = require('../api/IApiServiceManager');
import IStore = require("../import/IStore");
import IProjectRepositoryService = require("./IProjectRepositoryService");
import ConfigurationService = require('../configuration/ConfigurationService');
declare class ProjectRepositoryService implements IProjectRepositoryService {
    private store;
    private server;
    private config;
    private resourceTypeUrl;
    private dataUrl;
    private projectUrl;
    id: string;
    constructor(store: IStore);
    init(apiServiceManager: IApiServiceManager, server: express.Express, config: ConfigurationService.ConfigurationService): void;
    private endsWith(str, suffix);
    private yyyymmdd();
    shutdown(): void;
    getAll(): Object[];
    get(id: string, res: express.Response): void;
    create(id: string, resourceType: Object): any;
    delete(id: string): void;
    update(id: string, newObject: any): void;
}
export = ProjectRepositoryService;
