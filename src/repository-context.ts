import { IJsonFileService, JsonFileService } from "./json-file-service";
import { EntityNode } from "./entity-node";
import { Repository } from "./repository";

export abstract class RepositoryContext {
  
  abstract models: {[model: string]: Repository<any>};
  private dataPath: string;
  private jsonFileService: IJsonFileService;

  constructor(dataPath?: string, jsonFileService?: IJsonFileService) {
    this.dataPath = dataPath;
    this.jsonFileService = jsonFileService || new JsonFileService();
  }

  initialize = (): Promise<void> => {
    if (!this.dataPath) return Promise.resolve().then(_ => this.loadUnsetModels());
    return this.jsonFileService.getJson<{[model: string]: EntityNode[]}>(this.dataPath)
      .then(rslt => this.loadModels(rslt))
      .then(_ => this.loadUnsetModels());
  }

  saveChanges = (): Promise<void> => {
    if (!this.dataPath) return Promise.resolve();
    let keys = Object.keys(this.models);
    let file = keys.reduce((a, b) => {
      a[b] = this.models[b].getNodes();
      return a;
    }, {});
    return this.jsonFileService.writeJson(this.dataPath, file)
      .then(_ => this.markAllCurrent());
  }

  private loadModels = (models: {[model: string]: EntityNode[]}) => {
    let keys = Object.keys(models);
    for (var i = 0; i < keys.length; i++) {
      let model = this.models[keys[i]];
      if (!model) continue;
      model.setNodes(models[keys[i]]);
    }
  }

  private loadUnsetModels = () => {
    let keys = Object.keys(this.models);
    let unsetModels = keys.filter(key => this.models[key].state == 'unset');    
    for (var i = 0; i < unsetModels.length; i++) {
      this.models[unsetModels[i]].setNodes([]);
    }
  }

  private markAllCurrent = () => {
    let keys = Object.keys(this.models);
    for (var i = 0; i < keys.length; i++) {
      this.models[keys[i]].markCurrent();
    }
  }

}