import IImport = require("./IImport");
import RepeatEnum = require("./RepeatEnum");
import transform = require("./ITransform");
export declare class BaseImport implements IImport {
    id: string;
    title: string;
    sourceUrl: string;
    description: string;
    contributor: string;
    destination: string;
    tags: {
        [text: string]: string;
    };
    transformers: transform.ITransform[];
    repeat: RepeatEnum;
    lastRun: Date;
    constructor();
}
