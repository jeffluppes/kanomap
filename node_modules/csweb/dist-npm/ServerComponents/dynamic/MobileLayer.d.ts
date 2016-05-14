import express = require('express');
import MessageBus = require('../bus/MessageBus');
import ApiManager = require('../api/ApiManager');
import ClientConnection = require("../dynamic/ClientConnection");
declare module MobileLayer {
    class MobileLayer {
        manager: ApiManager.ApiManager;
        connection: ClientConnection.ConnectionManager;
        private count;
        layer: ApiManager.Layer;
        startDate: number;
        constructor(manager: ApiManager.ApiManager, layerId: string, typeUrl: string, server: express.Express, messageBus: MessageBus.MessageBusService, connection: ClientConnection.ConnectionManager);
    }
}
export = MobileLayer;
