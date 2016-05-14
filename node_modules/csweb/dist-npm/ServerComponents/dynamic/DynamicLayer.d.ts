import express = require('express');
import events = require('events');
import ClientConnection = require('./ClientConnection');
import MessageBus = require('../bus/MessageBus');
import ApiManager = require('../api/ApiManager');
import Layer = ApiManager.Layer;
import Feature = ApiManager.Feature;
export interface IDynamicLayer {
    geojson?: Layer;
    connection?: ClientConnection.ConnectionManager;
    getLayer(req: express.Request, res: express.Response): any;
    getDataSource(req: express.Request, res: express.Response): any;
    addFeature?: (feature: any) => void;
    updateFeature?: (ft: Feature, client?: string, notify?: boolean) => void;
    updateLog?: (featureId: string, msgBody: IMessageBody, client?: string, notify?: boolean) => void;
    layerId: string;
    start(): any;
    on?: (event: string, listener: Function) => events.EventEmitter;
}
export interface IPropertyUpdate {
    ts: number;
    prop: string;
    value: any;
}
export interface IMessageBody {
    featureId: string;
    logs?: {
        [prop: string]: IPropertyUpdate[];
    };
}
export declare class DynamicLayer extends events.EventEmitter implements IDynamicLayer {
    manager: ApiManager.ApiManager;
    layerId: string;
    private file;
    geojson: Layer;
    server: express.Express;
    messageBus: MessageBus.MessageBusService;
    connection: ClientConnection.ConnectionManager;
    startDate: number;
    constructor(manager: ApiManager.ApiManager, layerId: string, file: string, server: express.Express, messageBus: MessageBus.MessageBusService, connection: ClientConnection.ConnectionManager);
    getLayer(req: express.Request, res: express.Response): void;
    OpenFile(): void;
    getDataSource(req: express.Request, res: express.Response): void;
    initFeature(f: any): void;
    updateSensorValue(ss: any, date: number, value: number): void;
    addFeature(f: any, updated?: boolean): void;
    start(): void;
    updateLog(featureId: string, msgBody: IMessageBody, client?: string, notify?: boolean): void;
    updateFeature(ft: Feature, client?: string, notify?: boolean): void;
}
