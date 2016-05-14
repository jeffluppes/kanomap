import GeoJSON = require('../helpers/GeoJSON');
export interface IGridDataSourceParameters extends GeoJSON.IProperty {
    gridType?: string;
    projection?: string;
    propertyName?: string;
    commentCharacter?: string;
    separatorCharacter?: string;
    skipLines?: number;
    skipLinesAfterComment?: number;
    skipSpacesFromLine?: number;
    columns?: number;
    rows?: number;
    startLat?: number;
    startLon?: number;
    deltaLat?: number;
    deltaLon?: number;
    skipFirstColumn?: boolean;
    skipFirstRow?: boolean;
    minThreshold?: number;
    maxThreshold?: number;
    noDataValue?: number;
    useContour?: boolean;
    contourLevels?: number | number[];
}
export declare class IsoLines {
    static convertEsriHeaderToGridParams(input: string | Object, gridParams: IGridDataSourceParameters): void;
    private static getData(input);
    static convertDataToGrid(input: string | Object, gridParams: IGridDataSourceParameters): number[][];
    static convertDataToIsoLines(data: string, gridParams: IGridDataSourceParameters): GeoJSON.IGeoJson;
}
