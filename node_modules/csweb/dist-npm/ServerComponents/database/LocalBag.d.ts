import Location = require('./Location');
import IBagOptions = require('../database/IBagOptions');
export declare class LocalBag {
    private connectionString;
    private db;
    constructor(path: string);
    private formatZipCode(zipCode);
    private splitAdressNumber(input);
    private formatHouseNumber(input);
    private formatHouseLetter(input);
    private formatHouseNumberAddition(input);
    lookupBagArea(bounds: string, callback: (areas: Location[]) => void): void;
    lookupBagAddress(zip: string, houseNumber: string, bagOptions: IBagOptions, callback: (addresses: Location[]) => void): void;
    private indexes(source, find);
}
