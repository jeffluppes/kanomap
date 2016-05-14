import transform = require("./ITransform");
declare class CsvToJsonTransformer implements transform.ITransform {
    title: string;
    id: string;
    description: string;
    type: string;
    headers: string[];
    inputDataTypes: transform.InputDataType[];
    outputDataTypes: transform.OutputDataType[];
    fieldDelimiter: string;
    textQualifier: string;
    latField: string;
    longField: string;
    constructor(title: string);
    initialize(opt: any, callback: any): void;
    create(config: any, opt?: transform.ITransformFactoryOptions[]): NodeJS.ReadWriteStream;
}
export = CsvToJsonTransformer;
