//http://stackoverflow.com/questions/20606456/whats-the-recommended-way-of-creating-objects-in-nodejs
//https://gist.github.com/creationix/707146
//http://www.nodebeginner.org/
//http://nodejs.org/docs/v0.10.29/api/addons.html
var MAGIC_LO = 0x7161472F;
var MAGIC_HI = 0xFBC5AD95;
var MAGIC_PAYLOAD = 0x10F13467;
var DEFAULT_STREAM_BODY_BUFFER_SIZE = 16 * 1024;
var icHeartBeat = -4;
var icEndSession = -5;
var icFlushQueue = -6;
var icUniqueClientID = -7;
var icTimeStamp = -8;
var icEvent = -15;
var icEndClientSession = -21;
var icFlushClientQueue = -22;
var icConnectToGateway = -23;
var icSetClientInfo = -31;
var icSetVariable = -32;
var icAllVariables = -33;
var icSetState = -34;
var icSetThrottle = -35;
var icSetNoDelay = -36;
var icSetVariablePrefixed = -37;
var icRequestEventNames = -41;
var icEventNames = -42;
var icRequestSubscribers = -43;
var icRequestPublishers = -44;
var icSubscribe = -45;
var icUnsubscribe = -46;
var icPublish = -47;
var icUnpublish = -48;
var icSetEventIDTranslation = -49;
var icStatusEvent = -52;
var icStatusClient = -53;
var icStatusEventPlus = -54;
var icStatusClientPlus = -55;
var icStatusHUB = -56;
var icStatusTimer = -57;
var icHumanReadableHeader = -60;
var icSetMonitor = -61;
var icResetMonitor = -62;
var icCreateTimer = -73;
var icHUBLocate = -81;
var icHUBFound = -82;
var icLogClear = -91;
var icLogRequest = -92;
var icLogContents = -93;
var actionNew = 0;
var actionDelete = 1;
var actionChange = 2;
var ekChangeObjectEvent = 0;
var ekStreamHeader = 1;
var ekStreamBody = 2;
var ekStreamTail = 3;
var ekBuffer = 4;
var ekNormalEvent = 5;
var ekChangeObjectDataEvent = 6;
var ekChildEventAdd = 11;
var ekChildEventRemove = 12;
var ekLogWriteLn = 30;
var ekTimerCancel = 40;
var ekTimerPrepare = 41;
var ekTimerStart = 42;
var ekTimerStop = 43;
var ekTimerAcknowledgedListAdd = 45;
var ekTimerAcknowledgedListRemove = 46;
var ekTimerSetSpeed = 47;
var ekTimerTick = 48;
var ekTimerAcknowledge = 49;
var ekTimerStatusRequest = 50;
function signalCommand(aSocket, aCommand, aPayload) {
    var buffer = new Buffer(20 + aPayload.length);
    buffer.writeUInt32LE(MAGIC_LO, 0);
    buffer.writeUInt32LE(MAGIC_HI, 4);
    buffer.writeInt32LE(aCommand, 8);
    buffer.writeInt32LE(aPayload.length, 12);
    if (aPayload.length > 0) {
        aPayload.copy(buffer, 16);
        buffer.writeUInt32LE(MAGIC_PAYLOAD, buffer.length - 4);
    }
    aSocket.write(buffer);
}
function signalSubscribe(aSocket, aEventID, aEventEntryType, aEventName) {
    var eventNameByteLength = Buffer.byteLength(aEventName);
    var payload = new Buffer(12 + eventNameByteLength);
    payload.writeInt32LE(aEventID, 0);
    payload.writeInt32LE(aEventEntryType, 4);
    payload.writeInt32LE(eventNameByteLength, 8);
    payload.write(aEventName, 12);
    signalCommand(aSocket, icSubscribe, payload);
}
function signalUnSubscribe(aSocket, aEventName) {
    var eventNameByteLength = Buffer.byteLength(aEventName);
    var payload = new Buffer(4 + eventNameByteLength);
    payload.writeInt32LE(eventNameByteLength, 0);
    payload.write(aEventName, 4);
    signalCommand(aSocket, icUnsubscribe, payload);
}
function signalPublish(aSocket, aEventID, aEventEntryType, aEventName) {
    var eventNameByteLength = Buffer.byteLength(aEventName);
    var payload = new Buffer(12 + eventNameByteLength);
    payload.writeInt32LE(aEventID, 0);
    payload.writeInt32LE(aEventEntryType, 4);
    payload.writeInt32LE(eventNameByteLength, 8);
    payload.write(aEventName, 12);
    signalCommand(aSocket, icPublish, payload);
}
function signalUnPublish(aSocket, aEventName) {
    var eventNameByteLength = Buffer.byteLength(aEventName);
    var payload = new Buffer(4 + eventNameByteLength);
    payload.writeInt32LE(eventNameByteLength, 0);
    payload.write(aEventName, 4);
    signalCommand(aSocket, icUnpublish, payload);
}
function signalClientInfo(aSocket, aOwnerID, aOwnerName) {
    var ownerNameByteLength = Buffer.byteLength(aOwnerName);
    var payload = new Buffer(8 + ownerNameByteLength);
    payload.writeInt32LE(aOwnerID, 0);
    payload.writeInt32LE(ownerNameByteLength, 4);
    payload.write(aOwnerName, 8);
    signalCommand(aSocket, icSetClientInfo, payload);
}
function signalChangeObject(aSocket, aEventID, aAction, aObjectID, aAttribute) {
    var attributeByteLength = Buffer.byteLength(aAttribute);
    var payload = new Buffer(4 + 4 + 4 + 4 + 4 + 4 + attributeByteLength);
    payload.writeInt32LE(aEventID, 0);
    payload.writeInt32LE(0, 4);
    payload.writeInt32LE(ekChangeObjectEvent, 8);
    payload.writeInt32LE(aAction, 12);
    payload.writeInt32LE(aObjectID, 16);
    payload.writeInt32LE(attributeByteLength, 20);
    payload.write(aAttribute, 24);
    signalCommand(aSocket, icEvent, payload);
}
function signalNormalEvent(aSocket, aEventID, aEventKind, aEventPayload) {
    var payload = new Buffer(4 + 4 + 4 + aEventPayload.length);
    payload.writeInt32LE(aEventID, 0);
    payload.writeInt32LE(0, 4);
    payload.writeInt32LE(aEventKind, 8);
    aEventPayload.copy(payload, 12);
    signalCommand(aSocket, icEvent, payload);
}
function hashCode(s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
}
function signalStream(aSocket, aEventID, aStreamName, aStream) {
    var streamID = hashCode(aStreamName) + hashCode(aSocket.toString());
    var streamNameLength = Buffer.byteLength(aStreamName);
    var payload = new Buffer(4 + 4 + 4 + 4 + 4 + streamNameLength);
    payload.writeInt32LE(aEventID, 0);
    payload.writeInt32LE(0, 4);
    payload.writeInt32LE(ekStreamHeader, 8);
    payload.writeInt32LE(streamID, 12);
    payload.writeInt32LE(streamNameLength, 16);
    payload.write(aStreamName, 20);
    signalCommand(aSocket, icEvent, payload);
    aStream.on('data', function (chunk) {
        payload = new Buffer(4 + 4 + 4 + 4 + chunk.length);
        payload.writeInt32LE(aEventID, 0);
        payload.writeInt32LE(0, 4);
        payload.writeInt32LE(ekStreamBody, 8);
        payload.writeInt32LE(streamID, 12);
        chunk.copy(payload, 16);
        signalCommand(aSocket, icEvent, payload);
    });
    aStream.on('end', function () {
        payload = new Buffer(4 + 4 + 4 + 4);
        payload.writeInt32LE(aEventID, 0);
        payload.writeInt32LE(0, 4);
        payload.writeInt32LE(ekStreamTail, 8);
        payload.writeInt32LE(streamID, 12);
        signalCommand(aSocket, icEvent, payload);
    });
}
exports.TIMBConnection = function () {
    var fSocket = require("net").Socket();
    var fEventNames = [];
    var fEventTranslations = [];
    var fEventDefinitions = [];
    var fUniqueClientID = 0;
    var fClientID = 0;
    var fFederation = "TNOdemo";
    function handleEvent(aEventID, aEventKind, aEventPayload) {
        var eventName = fEventNames[aEventID];
        var eventDefinition = fEventDefinitions[aEventID];
        var shortEventName = eventName;
        if (eventName.toUpperCase().lastIndexOf((fFederation + ".").toUpperCase(), 0) === 0) {
            shortEventName = eventName.substring(fFederation.length + 1);
        }
        else {
            shortEventName = eventName;
        }
        switch (aEventKind) {
            case ekNormalEvent:
                if (eventDefinition.onNormalEvent !== null) {
                    eventDefinition.onNormalEvent(eventDefinition, aEventPayload);
                }
                break;
            case ekChangeObjectEvent:
                if (eventDefinition.onChangeObject !== null) {
                    var action = aEventPayload.readInt32LE(0);
                    var objectID = aEventPayload.readInt32LE(4);
                    var attributeNameSize = aEventPayload.readInt32LE(8);
                    var attributeName = aEventPayload.toString("utf8", 12, 12 + attributeNameSize);
                    eventDefinition.onChangeObject(action, objectID, shortEventName, attributeName);
                }
                break;
            case ekStreamHeader:
                if (eventDefinition.onStreamCreate != null) {
                    if (eventDefinition.streamDefinitions == null)
                        eventDefinition.streamDefinitions = {};
                    var streamID = aEventPayload.readInt32LE(0);
                    var streamNameSize = aEventPayload.readInt32LE(4);
                    var streamName = aEventPayload.toString("utf8", 8, 8 + streamNameSize);
                    var streamStream = eventDefinition.onStreamCreate(eventDefinition, streamName);
                    if (streamStream != null)
                        eventDefinition.streamDefinitions[streamID.toString()] = { ID: streamID, Name: streamName, stream: streamStream };
                }
                break;
            case ekStreamBody:
                if (eventDefinition.onStreamCreate != null) {
                    if (eventDefinition.streamDefinitions != null) {
                        var streamID = aEventPayload.readInt32LE(0);
                        var streamDefinition = eventDefinition.streamDefinitions[streamID];
                        if (streamDefinition != null)
                            streamDefinition.stream.write(aEventPayload.slice(4));
                    }
                }
                break;
            case ekStreamTail:
                if (eventDefinition.onStreamCreate != null) {
                    if (eventDefinition.streamDefinitions != null) {
                        var streamID = aEventPayload.readInt32LE(0);
                        var streamDefinition = eventDefinition.streamDefinitions[streamID];
                        if (streamDefinition != null) {
                            if (aEventPayload.length > 4)
                                streamDefinition.stream.end(aEventPayload.slice(4, aEventPayload.length));
                            else
                                streamDefinition.stream.end();
                            if (eventDefinition.onStreamEnd != null)
                                eventDefinition.onStreamEnd(eventDefinition, streamDefinition.stream, streamDefinition.streamName);
                            eventDefinition.streamDefinitions[streamID] = null;
                        }
                    }
                }
                break;
        }
    }
    function handleEndSession() {
    }
    function handleCommand(aCommand, aPayload) {
        var rxEventID;
        var txEventID;
        switch (aCommand) {
            case icEndSession:
                handleEndSession();
                break;
            case icUniqueClientID:
                fUniqueClientID = aPayload.readUInt32LE(0);
                fClientID = aPayload.readUInt32LE(4);
                break;
            case icEvent:
                txEventID = aPayload.readInt32LE(0);
                if (txEventID < fEventTranslations.length) {
                    rxEventID = fEventTranslations[txEventID];
                    var tick = aPayload.readUInt32LE(4);
                    var eventDef = aPayload.readUInt32LE(8);
                    var eventPayload = new Buffer(aPayload.length - 12);
                    aPayload.copy(eventPayload, 0, 12, aPayload.length);
                    handleEvent(rxEventID, eventDef, eventPayload);
                }
                else {
                    console.log("## received invalid event id " + txEventID.toString());
                }
                break;
            case icSetEventIDTranslation:
                txEventID = aPayload.readInt32LE(0);
                rxEventID = aPayload.readInt32LE(4);
                if (txEventID >= fEventTranslations.length) {
                    var preLength = fEventTranslations.length;
                    fEventTranslations.length = txEventID + 1;
                    for (var i = preLength; i < fEventTranslations.length - 1; i++) {
                        fEventTranslations[i] = -1;
                    }
                }
                fEventTranslations[txEventID] = rxEventID;
                break;
        }
    }
    var fBuffer = new Buffer(0);
    function onReadCommand(aNewData) {
        fBuffer = Buffer.concat([fBuffer, aNewData], fBuffer.length + aNewData.length);
        var offset = 0;
        while (offset <= fBuffer.length - 16) {
            var ml = fBuffer.readUInt32LE(offset);
            var mh = fBuffer.readUInt32LE(offset + 4);
            if (ml === MAGIC_LO && mh === MAGIC_HI) {
                offset += 8;
                var command = fBuffer.readInt32LE(offset);
                var payloadSize = fBuffer.readUInt32LE(offset + 4);
                offset += 8;
                if (payloadSize > 0) {
                    if (fBuffer.length - offset < payloadSize + 4) {
                        offset -= 8 + 8;
                        break;
                    }
                    var payload = new Buffer(payloadSize);
                    fBuffer.copy(payload, 0, offset, offset + payloadSize);
                    offset += payloadSize;
                    if (fBuffer.readUInt32LE(offset) === MAGIC_PAYLOAD) {
                        handleCommand(command, payload);
                    }
                    else {
                        console.log("## payload (" + payloadSize.toString() + ") not OK for " + command.toString());
                    }
                    offset += 4;
                }
                else {
                    handleCommand(command, new Buffer(0));
                }
            }
            else {
                offset++;
                console.log("## invalid magic: " + ml.toString(16) + mh.toString(16));
            }
        }
        if (offset !== 0) {
            if (offset < fBuffer.length) {
                var newBuffer = new Buffer(fBuffer.length - offset);
                fBuffer.copy(newBuffer, 0, offset, fBuffer.length);
                fBuffer = newBuffer;
            }
            else {
                fBuffer.length = 0;
            }
        }
    }
    function onDisconnect() {
    }
    function EventDefinition(aEventID, aEventName) {
        this.name = aEventName;
        this.id = aEventID;
        this.subscribed = false;
        this.published = false;
        this.onChangeObject = null;
        this.onNormalEvent = null;
        this.onStreamCreate = null;
        this.onStreamEnd = null;
        this.changeObject = function (aAction, aObjectID, aAttribute) {
            if (!this.published) {
                signalPublish(fSocket, this.id, 0, this.name);
                this.published = true;
            }
            signalChangeObject(fSocket, this.id, aAction, aObjectID, aAttribute);
        };
        this.normalEvent = function (aEventKind, aEventPayload) {
            if (!this.published) {
                signalPublish(fSocket, this.id, 0, this.name);
                this.published = true;
            }
            signalNormalEvent(fSocket, this.id, aEventKind, aEventPayload);
        };
        this.stream = function (aStreamName, aStream) {
            if (!this.published) {
                signalPublish(fSocket, this.id, 0, this.name);
                this.published = true;
            }
            signalStream(fSocket, this.id, aStreamName, aStream);
        };
    }
    function addOrSetEvent(aEventName) {
        var eventID = fEventNames.indexOf(aEventName);
        if (eventID < 0) {
            eventID = fEventNames.push(aEventName) - 1;
            if (fEventDefinitions.length < eventID + 1) {
                fEventDefinitions.length = eventID + 1;
            }
            fEventDefinitions[eventID] = new EventDefinition(eventID, aEventName);
        }
        return eventID;
    }
    this.connect = function (aRemoteHost, aRemotePort, aOwnerID, aOwnerName, aFederation) {
        fFederation = aFederation;
        fSocket.connect(aRemotePort, aRemoteHost);
        fSocket.on("data", onReadCommand);
        fSocket.on("end", onDisconnect);
        signalClientInfo(fSocket, aOwnerID, aOwnerName);
    };
    this.disconnect = function () {
        fSocket.end();
    };
    this.subscribe = function (aEventName, aUsePrefix) {
        if (aUsePrefix) {
            aEventName = fFederation + "." + aEventName;
        }
        var eventID = addOrSetEvent(aEventName);
        var eventDefinition = fEventDefinitions[eventID];
        signalSubscribe(fSocket, eventID, 0, aEventName);
        eventDefinition.subscribed = true;
        return eventDefinition;
    };
    this.unSubscribe = function (aEventName, aUsePrefix) {
        if (aUsePrefix) {
            aEventName = fFederation + "." + aEventName;
        }
        var eventID = fEventNames.indexOf(aEventName);
        if (eventID >= 0) {
            var eventDefinition = fEventDefinitions[eventID];
            signalUnSubscribe(fSocket, aEventName);
            eventDefinition.subscribed = false;
            return eventDefinition;
        }
        else {
            return null;
        }
    };
    this.publish = function (aEventName, aUsePrefix) {
        if (aUsePrefix) {
            aEventName = fFederation + "." + aEventName;
        }
        var eventID = addOrSetEvent(aEventName);
        var eventDefinition = fEventDefinitions[eventID];
        signalPublish(fSocket, eventID, 0, aEventName);
        eventDefinition.published = true;
        return eventDefinition;
    };
    this.unPublish = function (aEventName, aUsePrefix) {
        if (aUsePrefix) {
            aEventName = fFederation + "." + aEventName;
        }
        var eventID = fEventNames.indexOf(aEventName);
        if (eventID >= 0) {
            var eventDefinition = fEventDefinitions[eventID];
            signalUnPublish(fSocket, aEventName);
            eventDefinition.published = false;
            return eventDefinition;
        }
        else {
            return null;
        }
    };
};
exports.actionNew = actionNew;
exports.actionDelete = actionDelete;
exports.actionChange = actionChange;
exports.ekChangeObjectEvent = ekChangeObjectEvent;
exports.ekNormalEvent = ekNormalEvent;
//# sourceMappingURL=imb.js.map