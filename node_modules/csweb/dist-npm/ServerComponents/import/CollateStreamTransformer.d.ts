import transform = require("./ITransform");
declare class CollateStreamTransformer implements transform.ITransform {
    title: string;
    id: string;
    description: string;
    type: string;
    headers: string[];
    inputDataTypes: transform.InputDataType[];
    outputDataTypes: transform.OutputDataType[];
    constructor(title: string);
    initialize(opt: any, callback: any): void;
    create(config: any, opt?: transform.ITransformFactoryOptions[]): NodeJS.ReadWriteStream;
}
export = CollateStreamTransformer;
