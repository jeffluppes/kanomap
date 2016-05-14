import IConfiguration = require('./IConfiguration');
export declare class ConfigurationService implements IConfiguration {
    private configurationFile;
    private static theKeys;
    private static theValues;
    constructor(configurationFile: string);
    initialize(init: {
        key: string;
        value: string;
    }[]): void;
    add(key: string, value: string): void;
    remove(key: string): void;
    clear(): void;
    count(): number;
    keys(): string[];
    values(): string[];
    containsKey(key: string): boolean;
    toLookup(): IConfiguration;
}
