import express = require('express');
import IApiServiceManager = require('../api/IApiServiceManager');
import IImport = require("./IImport");
import transform = require("./ITransform");
import IStore = require("./IStore");
import IImporterRepositoryService = require("./IImporterRepositoryService");
import ConfigurationService = require('../configuration/ConfigurationService');
declare class ImporterRepositoryService implements IImporterRepositoryService {
    private store;
    private server;
    private config;
    private baseUrl;
    private transformers;
    id: string;
    constructor(store: IStore);
    init(apiServiceManager: IApiServiceManager, server: express.Express, config: ConfigurationService.ConfigurationService): void;
    shutdown(): void;
    runImporter(importer: IImport, callback: (error: Error) => void): void;
    addTransformer(transformer: transform.ITransform): void;
    getTransformerInstance(transformerDefinition: transform.ITransform): transform.ITransform;
    getAllTransformers(): transform.ITransform[];
    getAll(): Object[];
    get(id: string): any;
    create(id: string, importer: Object): Object;
    delete(id: string): void;
    update(importer: IImport): void;
}
export = ImporterRepositoryService;
