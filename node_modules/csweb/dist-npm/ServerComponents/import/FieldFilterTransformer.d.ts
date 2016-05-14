import transform = require("./ITransform");
declare class FieldFilterTransformer implements transform.ITransform {
    title: string;
    id: string;
    description: string;
    type: string;
    inputDataTypes: transform.InputDataType[];
    outputDataTypes: transform.OutputDataType[];
    geometry: any;
    filterProperty: string;
    filterValue: string | number | RegExp;
    constructor(title: string);
    initialize(opt: transform.ITransformFactoryOptions, callback: (error) => void): void;
    create(config: any, opt?: transform.ITransformFactoryOptions[]): NodeJS.ReadWriteStream;
}
export = FieldFilterTransformer;
