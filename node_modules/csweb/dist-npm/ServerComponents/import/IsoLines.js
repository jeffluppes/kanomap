var GeoJSON = require('../helpers/GeoJSON');
var Conrec = require('../helpers/conrec');
var IsoLines = (function () {
    function IsoLines() {
    }
    IsoLines.convertEsriHeaderToGridParams = function (input, gridParams) {
        var data = IsoLines.getData(input);
        var regex = /(\S*)\s*([\d-.]*)/;
        var lines = data.split('\n', 6);
        var x, y;
        var isCenter = false;
        gridParams.skipLines = 0;
        lines.forEach(function (line) {
            var matches = line.match(regex);
            if (matches.length !== 3)
                return;
            gridParams.skipLines++;
            var value = +matches[2];
            switch (matches[1].toLowerCase()) {
                case 'ncols':
                    gridParams.columns = value;
                    break;
                case 'nrows':
                    gridParams.rows = value;
                    break;
                case 'xllcorner':
                    x = value;
                    break;
                case 'yllcorner':
                    y = value;
                    break;
                case 'xllcenter':
                    x = value;
                    isCenter = true;
                    break;
                case 'yllcenter':
                    y = value;
                    isCenter = true;
                    break;
                case 'cellsize':
                    gridParams.deltaLon = value;
                    gridParams.deltaLat = -value;
                    break;
                case 'nodata_value':
                    gridParams.noDataValue = value;
                    break;
            }
        });
        if (isCenter) {
            gridParams.startLon = x;
            gridParams.startLat = y;
        }
        else {
            gridParams.startLon = x + gridParams.deltaLon / 2;
            gridParams.startLat = y - gridParams.deltaLat / 2;
        }
        if (!gridParams.projection)
            gridParams.projection = 'wgs84';
        switch (gridParams.projection) {
            case 'rd':
            case 'RD':
                var startLoc = GeoJSON.GeoExtensions.convertRDToWGS84(gridParams.startLon, gridParams.startLat - (gridParams.rows - 1) * gridParams.deltaLat);
                var endLoc = GeoJSON.GeoExtensions.convertRDToWGS84(gridParams.startLon + (gridParams.columns - 1) * gridParams.deltaLon, gridParams.startLat);
                gridParams.deltaLon = (endLoc.longitude - startLoc.longitude) / (gridParams.columns - 1);
                gridParams.deltaLat = (endLoc.latitude - startLoc.latitude) / (gridParams.rows - 1);
                gridParams.startLon = startLoc.longitude;
                gridParams.startLat = startLoc.latitude;
                break;
            case 'WGS84':
            case 'wgs84':
                gridParams.startLat -= (gridParams.rows - 1) * gridParams.deltaLat;
                break;
            default:
                throw new Error('Current projection is not supported!');
        }
    };
    IsoLines.getData = function (input) {
        if (typeof input === 'string') {
            return input;
        }
        else if (input.hasOwnProperty('data') && typeof input['data'] === 'string') {
            return input['data'];
        }
        else {
            console.log('GridDataSource error: could not read grid data!');
            return '';
        }
    };
    IsoLines.convertDataToGrid = function (input, gridParams) {
        var data = IsoLines.getData(input);
        if (!data)
            return;
        var propertyName = gridParams.propertyName || "v";
        var noDataValue = gridParams.noDataValue || -9999;
        var skipLinesAfterComment = gridParams.skipLinesAfterComment, skipSpacesFromLine = gridParams.skipSpacesFromLine, skipFirstRow = gridParams.skipFirstRow || false, skipFirstColumn = gridParams.skipFirstColumn || false;
        var separatorCharacter = gridParams.separatorCharacter || ' ', splitCellsRegex = new RegExp("[^" + separatorCharacter + "]+", "g");
        var deltaLon = gridParams.deltaLon, deltaLat = gridParams.deltaLat, lat = gridParams.startLat, lon = gridParams.startLon;
        var max = gridParams.maxThreshold || -Number.MAX_VALUE, min = gridParams.minThreshold || Number.MAX_VALUE;
        var lines = data.split('\n'), i = 0, gridData = [];
        if (gridParams.skipLines)
            lines.splice(0, gridParams.skipLines);
        var rowsToProcess = gridParams.rows || Number.MAX_VALUE;
        lines.forEach(function (line) {
            if (gridParams.commentCharacter)
                if (line.substr(0, 1) === gridParams.commentCharacter) {
                    console.log(line);
                    return;
                }
            if (skipLinesAfterComment && skipLinesAfterComment > 0) {
                skipLinesAfterComment--;
                return;
            }
            if (skipFirstRow) {
                skipFirstRow = false;
                return;
            }
            rowsToProcess--;
            if (rowsToProcess < 0)
                return gridData;
            var cells;
            if (skipSpacesFromLine)
                cells = line.substr(skipSpacesFromLine).match(splitCellsRegex);
            else
                cells = line.match(splitCellsRegex);
            if (skipFirstColumn && cells.length > 1)
                cells = cells.splice(1);
            if (!cells || (!gridParams.skipFirstColumn && cells.length < gridParams.columns))
                return;
            gridData[i] = [];
            cells.forEach(function (c) { return gridData[i].push(+c); });
            max = Math.max.apply(Math, [max].concat(gridData[i]));
            min = Math.min.apply(Math, [min].concat(gridData[i]));
            i++;
        });
        gridParams.maxThreshold = max;
        gridParams.minThreshold = min;
        return gridData;
    };
    IsoLines.convertDataToIsoLines = function (data, gridParams) {
        var gridData = IsoLines.convertDataToGrid(data, gridParams);
        var propertyName = gridParams.propertyName || "v";
        var longitudes = [], latitudes = [];
        var lat = gridParams.startLat, lon = gridParams.startLon, deltaLat = gridParams.deltaLat, deltaLon = gridParams.deltaLon;
        var max = gridParams.maxThreshold, min = gridParams.minThreshold;
        gridData.forEach(function (row) {
            latitudes.push(lat);
            lat += deltaLat;
        });
        gridData[0].forEach(function (col) {
            longitudes.push(lon);
            lon += deltaLon;
            if (lon > 180)
                lon -= 360;
        });
        var features = [];
        var conrec = new Conrec.Conrec(), nrIsoLevels, isoLevels;
        if (typeof gridParams.contourLevels === 'undefined')
            nrIsoLevels = 10;
        else {
            var cl = gridParams.contourLevels;
            if (typeof cl === 'number') {
                nrIsoLevels = cl;
            }
            else {
                isoLevels = cl;
                nrIsoLevels = cl.length;
            }
        }
        if (typeof isoLevels === 'undefined') {
            isoLevels = [];
            var dl = (max - min) / nrIsoLevels;
            for (var l = min + dl / 2; l < max; l += dl)
                isoLevels.push(Math.round(l * 10) / 10);
        }
        conrec.contour(gridData, 0, gridData.length - 1, 0, gridData[0].length - 1, latitudes, longitudes, nrIsoLevels, isoLevels, gridParams.noDataValue || -9999);
        var contourList = conrec.contourList;
        contourList.forEach(function (contour) {
            var result = {};
            result[propertyName] = contour.level;
            var feature = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon'
                },
                properties: result
            };
            var ring = [];
            feature.geometry.coordinates = [ring];
            contour.forEach(function (p) {
                ring.push([p.y, p.x]);
            });
            features.push(feature);
        });
        return GeoJSON.GeoJSONFactory.Create(features);
    };
    return IsoLines;
})();
exports.IsoLines = IsoLines;
//# sourceMappingURL=IsoLines.js.map