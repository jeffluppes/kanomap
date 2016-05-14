import ApiManager = require('./ApiManager');
import ApiMeta = ApiManager.ApiMeta;
import BaseConnector = require('./BaseConnector');
export declare class ImbAPI extends BaseConnector.BaseConnector {
    server: string;
    port: number;
    private layerPrefix;
    private keyPrefix;
    manager: ApiManager.ApiManager;
    client: any;
    router: any;
    imb: any;
    imbConnection: any;
    layersEvent: any;
    keysEvent: any;
    constructor(server: string, port?: number, layerPrefix?: string, keyPrefix?: string);
    init(layerManager: ApiManager.ApiManager, options: any): void;
    protected buildCmdValue(cmd: any, value: any): Buffer;
    addFeature(layerId: string, feature: any, meta: ApiMeta, callback: Function): void;
    updateFeature(layerId: string, feature: any, useLog: boolean, meta: ApiMeta, callback: Function): void;
    deleteFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): void;
    updateKey(keyId: string, value: Object, meta: ApiMeta, callback: Function): void;
    deleteKey(keyId: string, meta: ApiMeta, callback: Function): void;
}
