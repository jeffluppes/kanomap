import AuthApi = require('./AuthAPI');
import events = require('events');
export declare enum ApiResult {
    OK = 200,
    Error = 400,
    LayerAlreadyExists = 406,
    LayerNotFound = 407,
    FeatureNotFound = 408,
    ProjectAlreadyExists = 409,
    ProjectNotFound = 410,
    KeyNotFound = 411,
    GroupNotFound = 412,
    GroupAlreadyExists = 413,
    ResourceNotFound = 428,
    ResourceAlreadyExists = 429,
    SearchNotImplemented = 440,
}
export interface IApiManagerOptions {
    server?: string;
    mqttSubscriptions?: string[];
    [key: string]: any;
}
export interface ApiMeta {
    source?: string;
    user?: string;
}
export declare class CallbackResult {
    result: ApiResult;
    error: any;
    project: Project;
    layer: Layer;
    groups: string[];
    feature: Feature;
    features: Feature[];
    keys: {
        [keyId: string]: Key;
    };
    key: Key;
}
export declare enum Event {
    KeyChanged = 0,
    PropertyChanged = 1,
    FeatureChanged = 2,
    LayerChanged = 3,
    ProjectChanged = 4,
}
export declare enum ChangeType {
    Create = 0,
    Update = 1,
    Delete = 2,
}
export interface IChangeEvent {
    id: string;
    type: ChangeType;
    value?: Object;
}
export interface IConnector {
    id: string;
    isInterface: boolean;
    receiveCopy: boolean;
    init(layerManager: ApiManager, options: any, callback: Function): any;
    initLayer(layer: ILayer, meta?: ApiMeta): any;
    initProject(project: Project, meta?: ApiMeta): any;
    addLayer(layer: ILayer, meta: ApiMeta, callback: Function): any;
    getLayer(layerId: string, meta: ApiMeta, callback: Function): any;
    updateLayer(layer: ILayer, meta: ApiMeta, callback: Function): any;
    deleteLayer(layerId: string, meta: ApiMeta, callback: Function): any;
    searchLayer(layerId: string, keyWord: string, meta: ApiMeta, callback: Function): any;
    addFeature(layerId: string, feature: any, meta: ApiMeta, callback: Function): any;
    getFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): any;
    updateFeature(layerId: string, feature: any, useLog: boolean, meta: ApiMeta, callback: Function): any;
    deleteFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): any;
    addLog(layerId: string, featureId: string, property: string, log: Log, meta: ApiMeta, callback: Function): any;
    getLog(layerId: string, featureId: string, meta: ApiMeta, callback: Function): any;
    deleteLog(layerId: string, featureId: string, ts: number, prop: string, meta: ApiMeta, callback: Function): any;
    updateProperty(layerId: string, featureId: string, property: string, value: any, useLog: boolean, meta: ApiMeta, callback: Function): any;
    updateLogs(layerId: string, featureId: string, logs: {
        [key: string]: Log[];
    }, meta: ApiMeta, callback: Function): any;
    getBBox(layerId: string, southWest: number[], northEast: number[], meta: ApiMeta, callback: Function): any;
    getSphere(layerId: string, maxDistance: number, longtitude: number, latitude: number, meta: ApiMeta, callback: Function): any;
    getWithinPolygon(layerId: string, feature: Feature, meta: ApiMeta, callback: Function): any;
    addProject(project: Project, meta: ApiMeta, callback: Function): any;
    getProject(projectId: string, meta: ApiMeta, callback: Function): any;
    updateProject(project: Project, meta: ApiMeta, callback: Function): any;
    deleteProject(projectId: string, meta: ApiMeta, callback: Function): any;
    allGroups(projectId: string, meta: ApiMeta, callback: Function): any;
    addResource(reource: ResourceFile, meta: ApiMeta, callback: Function): any;
    addFile(base64: string, folder: string, file: string, meta: ApiMeta, callback: Function): any;
    getKey(keyId: string, meta: ApiMeta, callback: Function): any;
    getKeys(meta: ApiMeta, callback: Function): any;
    updateKey(keyId: string, value: Object, meta: ApiMeta, callback: Function): any;
    deleteKey(keyId: string, meta: ApiMeta, callback: Function): any;
    subscribeKey(keyPattern: string, meta: ApiMeta, callback: (topic: string, message: string, params?: Object) => void): any;
}
export interface StorageObject {
    id: string;
    storage: string;
}
export declare class Key implements StorageObject {
    id: string;
    title: string;
    storage: string;
    values: Object[];
}
export declare class Project implements StorageObject {
    id: string;
    title: string;
    url: string;
    description: string;
    logo: string;
    connected: boolean;
    storage: string;
    groups: Group[];
}
export declare class Group {
    id: string;
    title: string;
    description: string;
    clustering: boolean;
    clusterLevel: number;
    layers: Layer[];
}
export declare class KeySubscription {
    id: string;
    pattern: string;
    regexPattern: RegExp;
    callback: Function;
}
export interface ILayer extends StorageObject {
    server?: string;
    useLog?: boolean;
    updated?: number;
    enabled?: boolean;
    opacity?: number;
    id: string;
    type?: string;
    dynamic?: boolean;
    title?: string;
    image?: string;
    description?: string;
    url?: string;
    typeUrl?: string;
    defaultFeatureType?: string;
    defaultLegendProperty?: string;
    dynamicResource?: boolean;
    tags?: string[];
    isDynamic?: boolean;
    features?: Feature[];
    data?: any;
    [key: string]: any;
}
export declare class Layer implements StorageObject, ILayer {
    server: string;
    storage: string;
    useLog: boolean;
    updated: number;
    enabled: boolean;
    opacity: number;
    id: string;
    type: string;
    dynamic: boolean;
    title: string;
    image: string;
    description: string;
    url: string;
    typeUrl: string;
    defaultFeatureType: string;
    defaultLegendProperty: string;
    dynamicResource: boolean;
    tags: string[];
    isDynamic: boolean;
    features: Feature[];
}
export declare class ProjectId {
    id: string;
}
export declare class Geometry {
    type: string;
    coordinates: any;
}
export declare class Feature {
    type: string;
    id: string;
    geometry: Geometry;
    properties: {
        [key: string]: any;
    };
    logs: {
        [key: string]: Log[];
    };
}
export interface IProperty {
    [key: string]: any;
}
export declare class Property implements IProperty {
    [key: string]: any;
}
export declare class Log {
    ts: number;
    prop: string;
    value: any;
}
export declare class FeatureType {
}
export declare class PropertyType {
}
export declare class ResourceFile implements StorageObject {
    featureTypes: {
        [key: string]: FeatureType;
    };
    propertyTypes: {
        [key: string]: PropertyType;
    };
    id: string;
    storage: string;
}
export declare class ApiManager extends events.EventEmitter {
    isClient: boolean;
    options: IApiManagerOptions;
    connectors: {
        [key: string]: IConnector;
    };
    resources: {
        [key: string]: ResourceFile;
    };
    layers: {
        [key: string]: ILayer;
    };
    projects: {
        [key: string]: Project;
    };
    keys: {
        [keyId: string]: Key;
    };
    keySubscriptions: {
        [id: string]: KeySubscription;
    };
    defaultStorage: string;
    defaultLogging: boolean;
    rootPath: string;
    projectsFile: string;
    layersFile: string;
    namespace: string;
    name: string;
    authService: AuthApi.AuthAPI;
    constructor(namespace: string, name: string, isClient?: boolean, options?: IApiManagerOptions);
    init(rootPath: string, callback: Function): void;
    loadLayerConfig(cb: Function): void;
    loadProjectConfig(cb: Function): void;
    saveProjectDelay: (project: Project) => void;
    saveLayersDelay: (layer: ILayer) => void;
    saveProjectConfig(): void;
    saveLayerConfig(): void;
    initResources(resourcesPath: string): void;
    addFile(base64: string, folder: string, file: string, meta: ApiMeta, callback: Function): void;
    addResource(resource: ResourceFile, meta: ApiMeta, callback: Function): void;
    getResource(id: string): ResourceFile;
    addLayerToProject(projectId: string, groupId: string, layerId: string, meta: ApiMeta, callback: Function): void;
    removeLayerFromProject(projectId: string, groupId: string, layerId: string, meta: ApiMeta, callback: Function): void;
    allGroups(projectId: string, meta: ApiMeta, callback: Function): void;
    addGroup(group: Group, projectId: string, meta: ApiMeta, callback: Function): void;
    removeGroup(groupId: string, projectId: string, meta: ApiMeta, callback: Function): void;
    addProject(project: Project, meta: ApiMeta, callback: Function): void;
    addConnector(key: string, s: IConnector, options: any, callback?: Function): void;
    addConnectors(connectors: {
        key: string;
        s: IConnector;
        options: any;
    }[], callback: Function): void;
    findLayer(layerId: string): ILayer;
    findProject(projectId: string): Project;
    findKey(keyId: string): Key;
    findFeature(layerId: string, featureId: string, callback: Function): void;
    findStorage(object: StorageObject): IConnector;
    findStorageForLayerId(layerId: string): IConnector;
    findStorageForProjectId(projectId: string): IConnector;
    findStorageForKeyId(keyId: string): IConnector;
    getProjectDefinition(project: Project): Project;
    getGroupDefinition(group: Group): Group;
    getLayerDefinition(layer: ILayer): ILayer;
    getProject(projectId: string, meta: ApiMeta, callback: Function): void;
    searchLayers(keyword: string, layerIds: string[], meta: ApiMeta, callback: Function): void;
    getLayer(layerId: string, meta: ApiMeta, callback: Function): void;
    createLayer(layer: ILayer, meta: ApiMeta, callback: (result: CallbackResult) => void): void;
    addUpdateLayer(layer: ILayer, meta: ApiMeta, callback: Function): void;
    updateProjectTitle(projectTitle: string, projectId: string, meta: ApiMeta, callback: Function): void;
    updateProject(project: Project, meta: ApiMeta, callback: Function): void;
    deleteLayer(layerId: string, meta: ApiMeta, callback: Function): void;
    deleteProject(projectId: string, meta: ApiMeta, callback: Function): void;
    getInterfaces(meta: ApiMeta): IConnector[];
    private setUpdateLayer(layer, meta);
    addFeature(layerId: string, feature: Feature, meta: ApiMeta, callback: Function): void;
    updateProperty(layerId: string, featureId: string, property: string, value: any, useLog: boolean, meta: ApiMeta, callback: Function): void;
    updateLogs(layerId: string, featureId: string, logs: {
        [key: string]: Log[];
    }, meta: ApiMeta, callback: Function): void;
    getFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): void;
    updateFeature(layerId: string, feature: any, meta: ApiMeta, callback: Function): void;
    deleteFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): void;
    addLog(layerId: string, featureId: string, property: string, log: Log, meta: ApiMeta, callback: Function): void;
    initLayer(layer: Layer): void;
    initProject(project: Project): void;
    getLog(layerId: string, featureId: string, meta: ApiMeta, callback: Function): void;
    deleteLog(layerId: string, featureId: string, ts: number, prop: string, meta: ApiMeta, callback: Function): void;
    getBBox(layerId: string, southWest: number[], northEast: number[], meta: ApiMeta, callback: Function): void;
    getSphere(layerId: string, maxDistance: number, lng: number, lat: number, meta: ApiMeta, callback: Function): void;
    getWithinPolygon(layerId: string, feature: Feature, meta: ApiMeta, callback: Function): void;
    subscribeKey(pattern: string, meta: ApiMeta, callback: (topic: string, message: string, params?: Object) => void): KeySubscription;
    addKey(key: Key, meta: ApiMeta, callback: Function): void;
    getKeys(meta: ApiMeta, callback: Function): void;
    getKey(id: string, meta: ApiMeta, callback: Function): void;
    updateKey(keyId: string, value: Object, meta?: ApiMeta, callback?: Function): void;
    cleanup(callback?: Function): void;
}
