import express = require('express');
import ConfigurationService = require('../configuration/ConfigurationService');
import Location = require('./Location');
import IBagOptions = require('../database/IBagOptions');
export declare class BagDatabase {
    private connectionString;
    constructor(config: ConfigurationService.ConfigurationService);
    private formatZipCode(zipCode);
    private splitAdressNumber(input);
    private formatHouseNumber(input);
    private formatHouseLetter(input);
    private formatHouseNumberAddition(input);
    lookupBagArea(bounds: string, callback: (areas: Location[]) => void): void;
    lookupBagAddress(zip: string, houseNumber: string, bagOptions: IBagOptions, callback: (addresses: Location[]) => void): void;
    private indexes(source, find);
    lookupAddress(req: express.Request, res: express.Response): express.Response;
}
