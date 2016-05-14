import express = require('express');
import ClientConnection = require("./ClientConnection");
import DynamicLayer = require("./DynamicLayer");
declare module DataSource {
    class SensorSet {
        id: string;
        title: string;
        type: string;
        timestamps: number[];
        values: any[];
        activeValue: any;
        constructor(id: string);
    }
    class DataSource {
        id: string;
        url: string;
        type: string;
        title: string;
        sensors: {
            [key: string]: SensorSet;
        };
        static LoadData(ds: DataSource, callback: Function): void;
    }
    class DataSourceService implements DynamicLayer.IDynamicLayer {
        Connection: ClientConnection.ConnectionManager;
        layerId: string;
        static result: DataSource;
        constructor(Connection: ClientConnection.ConnectionManager, layerId: string);
        getLayer(req: express.Request, res: express.Response): void;
        getDataSource(req: express.Request, res: express.Response): void;
        updateSensorValue(ss: SensorSet, date: number, value: number): void;
        start(): void;
    }
}
export = DataSource;
