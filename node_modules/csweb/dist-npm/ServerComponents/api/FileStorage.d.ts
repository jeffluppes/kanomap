import ApiManager = require('./ApiManager');
import Project = ApiManager.Project;
import Layer = ApiManager.Layer;
import ResourceFile = ApiManager.ResourceFile;
import Feature = ApiManager.Feature;
import Key = ApiManager.Key;
import Log = ApiManager.Log;
import ApiMeta = ApiManager.ApiMeta;
import BaseConnector = require('./BaseConnector');
export interface Media {
    base64: string;
    fileUri: string;
}
export declare class FileStorage extends BaseConnector.BaseConnector {
    rootpath: string;
    manager: ApiManager.ApiManager;
    layers: {
        [key: string]: Layer;
    };
    projects: {
        [key: string]: Project;
    };
    keys: {
        [key: string]: Key;
    };
    resources: {
        [key: string]: ResourceFile;
    };
    layersPath: string;
    keysPath: string;
    blobPath: string;
    iconPath: string;
    projectsPath: string;
    resourcesPath: string;
    constructor(rootpath: string, watch?: boolean);
    watchLayersFolder(): void;
    watchProjectsFolder(): void;
    watchKeysFolder(): void;
    watchResourcesFolder(): void;
    saveProjectDelay: (project: ApiManager.Project) => void;
    saveResourcesDelay: (res: ApiManager.ResourceFile) => void;
    saveKeyDelay: (key: ApiManager.Key) => void;
    saveLayerDelay: (layer: ApiManager.Layer) => void;
    private getProjectFilename(projectId);
    private getLayerFilename(layerId);
    private getKeyFilename(keyId);
    private getResourceFilename(resId);
    private saveKeyFile(key);
    private saveResourceFile(res);
    private saveProjectFile(project);
    private saveBase64(media);
    private saveLayerFile(layer);
    private getProjectId(fileName);
    private getKeyId(fileName);
    private getResourceId(fileName);
    private getLayerId(fileName);
    private closeLayerFile(fileName);
    private closeKeyFile(fileName);
    private closeResourceFile(fileName);
    private closeProjectFile(fileName);
    private openLayerFile(fileName);
    private openKeyFile(fileName);
    private openResourceFile(fileName);
    private openProjectFile(fileName);
    findLayer(layerId: string): Layer;
    addProject(project: Project, meta: ApiMeta, callback: Function): void;
    getProject(projectId: string, meta: ApiMeta, callback: Function): void;
    updateProject(project: Project, meta: ApiMeta, callback: Function): void;
    addLayer(layer: Layer, meta: ApiMeta, callback: Function): void;
    getLayer(layerId: string, meta: ApiMeta, callback: Function): void;
    updateLayer(layer: Layer, meta: ApiMeta, callback: Function): void;
    deleteLayer(layerId: string, meta: ApiMeta, callback: Function): void;
    searchLayer(layerId: string, keyWord: string, meta: ApiMeta, callback: Function): void;
    addFeature(layerId: string, feature: Feature, meta: ApiMeta, callback: Function): void;
    updateProperty(layerId: string, featureId: string, property: string, value: any, useLog: boolean, meta: ApiMeta, callback: Function): void;
    updateLogs(layerId: string, featureId: string, logs: {
        [key: string]: Log[];
    }, meta: ApiMeta, callback: Function): void;
    getFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): void;
    updateFeature(layerId: string, feature: any, useLog: boolean, meta: ApiMeta, callback: Function): void;
    deleteFeature(layerId: string, featureId: string, meta: ApiMeta, callback: Function): void;
    addFile(base64: string, folder: string, file: string, meta: ApiMeta, callback: Function): void;
    addResource(res: ResourceFile, meta: ApiMeta, callback: Function): void;
    addKey(key: Key, meta: ApiMeta, callback: Function): void;
    getKey(keyId: string, meta: ApiMeta, callback: Function): void;
    updateKey(keyId: string, value: Object, meta: ApiMeta, callback: Function): void;
    init(layerManager: ApiManager.ApiManager, options: any): void;
}
