import express = require('express');
import ClientConnection = require('./ClientConnection');
declare module LayerDirectory {
    class LayerDirectory {
        server: express.Express;
        connection: ClientConnection.ConnectionManager;
        project: any;
        constructor(server: express.Express, connection: ClientConnection.ConnectionManager);
        Start(): void;
        GetDirectory(req: express.Request, res: express.Response): void;
    }
}
export = LayerDirectory;
