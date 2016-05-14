import express = require('express');
import MessageBus = require('../bus/MessageBus');
import BagDatabase = require('../database/BagDatabase');
import IGeoJsonFeature = require('./IGeoJsonFeature');
import Api = require('../api/ApiManager');
export interface ILayerDefinition {
    projectTitle: string;
    reference: string;
    group: string;
    layerTitle: string;
    description: string;
    featureType: string;
    geometryType: string;
    parameter1: string;
    parameter2: string;
    parameter3: string;
    parameter4: string;
    iconUri: string;
    iconSize: number;
    drawingMode: string;
    fillColor: string;
    strokeColor: string;
    selectedStrokeColor: string;
    strokeWidth: number;
    isEnabled: boolean;
    clusterLevel: number;
    useClustering: boolean;
    opacity: number;
    nameLabel: string;
    includeOriginalProperties: boolean;
    defaultFeatureType: string;
}
export interface IProperty {
    [key: string]: any;
}
export interface IPropertyType {
    label?: string;
    title?: string;
    description?: string;
    type?: string;
    section?: string;
    stringFormat?: string;
    visibleInCallOut?: boolean;
    canEdit?: boolean;
    filterType?: string;
    isSearchable?: boolean;
    minValue?: number;
    maxValue?: number;
    defaultValue?: number;
    count?: number;
    calculation?: string;
    subject?: string;
    target?: string;
    targetrelation?: string;
    targetproperty?: string;
    options?: string[];
    activation?: string;
    targetid?: string;
}
export interface ILayerTemplate {
    layerDefinition: ILayerDefinition[];
    propertyTypes: IPropertyType[];
    properties: IProperty[];
    sensors?: IProperty[];
    projectId?: string;
    iconBase64?: string;
}
export interface IBagContourRequest {
    bounds: string;
    layer: any;
}
export declare class MapLayerFactory {
    private bag;
    private messageBus;
    templateFiles: IProperty[];
    featuresNotFound: any;
    apiManager: Api.ApiManager;
    constructor(bag: BagDatabase.BagDatabase, messageBus: MessageBus.MessageBusService, apiManager: Api.ApiManager);
    process(req: express.Request, res: express.Response): void;
    private splitJson(data);
    sendIconThroughApiManager(b64: string, path: string): void;
    sendResourceThroughApiManager(data: any, resourceId: string): void;
    sendLayerThroughApiManager(data: any): void;
    processBagContours(req: express.Request, res: express.Response): void;
    createMapLayer(template: ILayerTemplate, callback: (Object) => void): {
        type: string;
        featureTypes: {};
        features: IGeoJsonFeature[];
    };
    private convertTimebasedPropertyData(template);
    private createPolygonFeature(templateName, par1, inclTemplProps, features, properties, propertyTypes, sensors, callback);
    private createLatLonFeature(latString, lonString, features, properties, sensors, callback);
    private createRDFeature(rdX, rdY, features, properties, sensors, callback);
    private mergeHouseNumber(zipCode, houseNumber, letter, addition, properties);
    private createPointFeature(zipCode, houseNumber, bagOptions, features, properties, propertyTypes, sensors, callback);
    private createFeature(lon, lat, properties, sensors?);
    private createPropertyType(propertyTypes, name, section?);
    private convertTime(date, time);
    private convertDateProperties(propertyTypes, properties);
    private convertTypes(propertyTypes, properties);
    private convertStringFormats(properties);
}
