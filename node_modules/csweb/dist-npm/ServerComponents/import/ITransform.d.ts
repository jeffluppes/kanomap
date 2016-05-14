import stream = require('stream');
import IImport = require('./IImport');
import ConfigurationService = require('../configuration/ConfigurationService');
export declare enum InputDataType {
    file = 0,
    url = 1,
    mongo = 2,
    pg = 3,
    shape = 4,
    geojson = 5,
    zip = 6,
}
export declare enum OutputDataType {
    file = 0,
    geojson = 1,
    mongo = 2,
    pg = 3,
}
export interface IParameterType {
    title: string;
    description: string;
    type: string;
}
export interface IParameter {
    value: string | number | boolean;
    type: IParameterType;
}
export interface ITransformFactoryOptions extends stream.TransformOptions {
    importer?: IImport;
    parameters?: IParameter[];
}
export interface ITransform {
    id: string;
    title: string;
    description?: string;
    type: string;
    inputDataTypes?: InputDataType[];
    outputDataTypes?: OutputDataType[];
    create?(config: ConfigurationService.ConfigurationService, opt?: ITransformFactoryOptions): NodeJS.ReadWriteStream;
    initialize(opt: ITransformFactoryOptions, callback: (error) => void): any;
}
