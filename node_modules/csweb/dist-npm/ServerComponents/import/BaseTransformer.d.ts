import transform = require("./ITransform");
declare class BaseTransformer implements transform.ITransform {
    title: string;
    id: string;
    description: string;
    type: any;
    inputDataTypes: transform.InputDataType[];
    outputDataTypes: transform.OutputDataType[];
    initialize(): void;
    constructor(title: string);
}
export = BaseTransformer;
