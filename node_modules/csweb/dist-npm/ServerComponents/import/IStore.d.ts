import express = require('express');
interface IStore {
    save(id?: string, resource?: any): any;
    get(id: string): Object;
    getAsync?(id: string, res: express.Response): any;
    getAll(): Object[];
    delete(id: string): any;
    create(id: string, resource: any): any;
    update(id: string, resource: any): any;
}
export = IStore;
