import ApiManager = require('../api/ApiManager');
export interface IGeoJson {
    id?: string;
    type?: string;
    features: ApiManager.Feature[];
    [key: string]: any;
}
export declare class GeoJSONFactory {
    static Create(features: ApiManager.Feature[]): IGeoJson;
}
export interface IGeoJsonGeometry {
    type: string;
    coordinates: any;
}
export interface IStringToAny {
    [key: string]: any;
}
export interface IFeature {
    id?: string;
    type?: string;
    geometry?: IGeoJsonGeometry;
    properties?: IStringToAny;
    logs?: {};
    isInitialized?: boolean;
    sensors?: {
        [id: string]: any[];
    };
    timestamps?: number[];
}
export interface IProperty {
    [key: string]: any;
}
export declare class GeoExtensions {
    static deg2rad(degree: number): number;
    static rad2deg(rad: number): number;
    static convertRDToWGS84(x: number, y: number): {
        latitude: number;
        longitude: number;
    };
    static log10(val: any): number;
    static convertDegreesToMeters(latitudeDegrees: number): {
        latitudeLength: number;
        longitudeLength: number;
    };
}
