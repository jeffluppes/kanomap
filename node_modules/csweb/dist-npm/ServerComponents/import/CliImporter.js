var Store = require('./Store');
var ConfigurationService = require('../configuration/ConfigurationService');
var ImporterRepositoryService = require('./ImporterRepositoryService');
var CsvToJsonTransformer = require('./CsvToJsonTransformer');
var KvKToJsonTransformer = require('./KvKToJsonTransformer');
var SplitAdresTransformer = require('./SplitAdresTransformer');
var BagDetailsTransformer = require('./BagDetailsTransformer');
var GeoJsonAggregateTransformer = require('./GeoJsonAggregateTransformer');
var GeoJsonOutputTransformer = require('./GeoJsonOutputTransformer');
var FieldFilterTransformer = require('./FieldFilterTransformer');
var GeoJsonSplitTransformer = require('./GeoJsonSplitTransformer');
var GeoJsonFeaturesTransformer = require('./GeoJsonFeaturesTransformer');
var CollateStreamTransformer = require('./CollateStreamTransformer');
var GeoJsonSaveTransformer = require('./GeoJsonSaveTransformer');
var BushalteAggregateTransformer = require('./BushalteAggregateTransformer');
var MergeGeoJsonTransformer = require('./MergeGeoJsonTransformer');
var AggregateOpportunitiesToOrganisationTransformer = require('./AggregateOpportunitiesToOrganisationTransformer');
var FieldSplitTransformer = require('./FieldSplitTransformer');
var AggregateOpportunitiesToGeoJsonTransformer = require('./AggregateOpportunitiesToGeoJsonTransformer');
var config = new ConfigurationService.ConfigurationService('./configuration.json');
var store = new Store.FileStore({ storageFile: config['importersStore'] });
var importerService = new ImporterRepositoryService(store);
var transformers = [
    new CsvToJsonTransformer("Convert Csv to JSON"),
    new KvKToJsonTransformer("Convert KvK to JSON"),
    new SplitAdresTransformer("Split adres"),
    new BagDetailsTransformer("Lookup BAG details"),
    new GeoJsonAggregateTransformer("GeoJSON aggregate"),
    new FieldFilterTransformer("Filter gemeente Utrecht"),
    new GeoJsonOutputTransformer("GeoJSON output"),
    new GeoJsonSplitTransformer("GeoJSON split"),
    new GeoJsonFeaturesTransformer("GeoJSON features input"),
    new CollateStreamTransformer("Wait for complete stream"),
    new GeoJsonSaveTransformer("Save GeoJSON"),
    new BushalteAggregateTransformer("Aggegreer Bushaltedata"),
    new MergeGeoJsonTransformer("Merge GeoJSON"),
    new AggregateOpportunitiesToOrganisationTransformer("Aggregate opportunities"),
    new FieldSplitTransformer("Split on field"),
    new AggregateOpportunitiesToGeoJsonTransformer("Aggregate opportunities to GeoJson")
];
transformers.forEach(function (t) {
    importerService.addTransformer(t);
});
var importerId;
try {
    importerId = process.argv[2];
    if (!importerId)
        throw new Error("Importer id not specified");
}
catch (err) {
    console.log(err);
    process.exit(10);
}
var importers = importerService.getAll();
console.log(importers);
var importer = importerService.get(importerId);
if (!importer) {
    console.log("Importer with id '" + importerId + "' not found");
    process.exit(11);
}
console.log("Running importer: " + importerId);
importerService.runImporter(importer, function (error) {
    if (error) {
        console.log("Error running importers: " + error);
        process.exit(20);
    }
    console.log("done");
});
//# sourceMappingURL=CliImporter.js.map