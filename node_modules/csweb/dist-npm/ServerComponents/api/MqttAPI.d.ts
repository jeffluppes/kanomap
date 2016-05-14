import ApiManager = require('./ApiManager');
import Layer = ApiManager.Layer;
import Log = ApiManager.Log;
import ApiMeta = ApiManager.ApiMeta;
import mqttrouter = require("mqtt-router");
import BaseConnector = require('./BaseConnector');
export declare class MqttAPI extends BaseConnector.BaseConnector {
    server: string;
    port: number;
    layerPrefix: string;
    keyPrefix: string;
    manager: ApiManager.ApiManager;
    client: any;
    router: mqttrouter.MqttRouter;
    constructor(server: string, port?: number, layerPrefix?: string, keyPrefix?: string);
    init(layerManager: ApiManager.ApiManager, options: any, callback: Function): void;
    private extractLayer(message);
    subscribeKey(keyPattern: string, meta: ApiMeta, callback: (topic: string, message: string, params?: Object) => void): void;
    addLayer(layer: Layer, meta: ApiMeta, callback: Function): void;
    addFeature(layerId: string, feature: any, meta: ApiMeta, callback: Function): void;
    updateLayer(layer: Layer, meta: ApiMeta, callback: Function): void;
    updateFeature(layerId: string, feature: any, useLog: boolean, meta: ApiMeta, callback: Function): void;
    private sendFeature(layerId, featureId);
    updateProperty(layerId: string, featureId: string, property: string, value: any, useLog: boolean, meta: ApiMeta, callback: Function): void;
    updateLogs(layerId: string, featureId: string, logs: {
        [key: string]: Log[];
    }, meta: ApiMeta, callback: Function): void;
    initLayer(layer: Layer): void;
    private getKeyChannel(keyId);
    updateKey(keyId: string, value: Object, meta: ApiMeta, callback: Function): void;
}
