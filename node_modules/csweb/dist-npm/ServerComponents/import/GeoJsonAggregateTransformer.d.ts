import transform = require("./ITransform");
declare class GeoJsonAggregateTransformer implements transform.ITransform {
    title: string;
    id: string;
    description: string;
    type: string;
    inputDataTypes: transform.InputDataType[];
    outputDataTypes: transform.OutputDataType[];
    geometry: any;
    constructor(title: string);
    initialize(opt: transform.ITransformFactoryOptions[], callback: (error) => void): void;
    create(config: any, opt?: transform.ITransformFactoryOptions[]): NodeJS.ReadWriteStream;
}
export = GeoJsonAggregateTransformer;
