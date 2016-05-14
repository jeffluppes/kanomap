import ApiManager = require('../api/ApiManager');
import Feature = ApiManager.Feature;
import Property = ApiManager.Property;
declare class WorldState {
    startTime: Date;
    currentTime: Date;
    properties: Property[];
    features: Feature[];
    activeFeature: Feature;
    activeLayerId: string;
}
export = WorldState;
