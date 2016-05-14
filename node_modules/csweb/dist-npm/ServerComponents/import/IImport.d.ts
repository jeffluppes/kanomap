import transform = require("./ITransform");
import RepeatEnum = require("./RepeatEnum");
interface IImport {
    id: string;
    title: string;
    sourceUrl: string;
    destinations?: string[];
    description?: string;
    contributor?: string;
    image?: string;
    tags?: {
        [text: string]: string;
    };
    transformers?: transform.ITransform[];
    repeat?: RepeatEnum;
    lastRun?: Date;
}
export = IImport;
