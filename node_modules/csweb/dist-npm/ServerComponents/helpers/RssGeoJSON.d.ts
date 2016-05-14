export declare class RssGeoJSON {
    type: string;
    features: RssFeature[];
}
export declare class RssFeature {
    type: string;
    id: string;
    geometry: {
        type: string;
        coordinates: number[];
    };
    properties: {
        [key: string]: string | number | boolean | Date | any;
    };
    constructor(lat?: number | string, lon?: number | string);
}
