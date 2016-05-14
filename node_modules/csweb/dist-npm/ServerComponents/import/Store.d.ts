import express = require('express');
import IStore = require("./IStore");
export declare class FileStore implements IStore {
    private store;
    private resources;
    constructor(opt?: {
        [key: string]: any;
    });
    private load();
    save(): void;
    getAll(): Object[];
    get(id: string): any;
    create(id: string, newObject: any): void;
    delete(id: string): any;
    update(id: string, resource: any): void;
}
export declare class FolderStore implements IStore {
    private folder;
    private resources;
    constructor(opt?: {
        [key: string]: any;
    });
    private load(callback?);
    save(id: string, resource: any): void;
    getAll(): string[];
    get(id: string): string;
    getAsync(id: string, res: express.Response): void;
    create(id: string, resource: any): void;
    delete(id: string): any;
    update(id: string, resource: any): void;
}
