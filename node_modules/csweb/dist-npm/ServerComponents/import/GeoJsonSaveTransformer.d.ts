import transform = require("./ITransform");
declare class GeoJsonSaveTransformer implements transform.ITransform {
    title: string;
    id: string;
    description: string;
    type: string;
    inputDataTypes: transform.InputDataType[];
    outputDataTypes: transform.OutputDataType[];
    targetFolder: string;
    filenameKey: string;
    filename: string;
    generateMetadata: boolean;
    generateKeysOnly: boolean;
    nameLabel: string;
    FeatureTypeId: string;
    constructor(title: string);
    initialize(opt: transform.ITransformFactoryOptions, callback: (error) => void): void;
    create(config: any, opt?: transform.ITransformFactoryOptions): NodeJS.ReadWriteStream;
}
export = GeoJsonSaveTransformer;
