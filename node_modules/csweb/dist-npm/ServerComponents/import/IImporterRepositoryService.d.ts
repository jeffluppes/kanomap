import IApiService = require('../api/IApiService');
import transform = require("./ITransform");
interface IImporterRepositoryService extends IApiService {
    getAll(): Object[];
    get(id: string): Object;
    delete(id: string): any;
    create(id: string, importer: Object): Object;
    update(importer: Object): any;
    addTransformer(transformer: transform.ITransform): any;
}
export = IImporterRepositoryService;
