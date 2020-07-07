import { JsonFileService } from "./json-file-service";
import { IEntityNodeService } from './entity-node-service';
import { EntityNode } from "./entity-node";
import { IRepository } from "./repository";

export abstract class RepositoryContext {
  
  abstract models: {[model: string]: IRepository<any>};
  private dataPath: string;
  private entityNodeService: IEntityNodeService;

  constructor(dataPath?: string, entityNodeService?: IEntityNodeService) {
    this.dataPath = dataPath;
    this.entityNodeService = entityNodeService || new JsonFileService();
  }

  initialize = (): Promise<void> => {
    if (!this.dataPath) return Promise.resolve().then(_ => this.loadUnsetModels());
    return this.entityNodeService.getEntityNodes(this.dataPath)
      .then(rslt => this.loadModels(rslt))
      .then(_ => this.loadUnsetModels())
      .catch(_ => this.loadUnsetModels())
  }

  saveChanges = (): Promise<void> => {
    if (!this.dataPath) return Promise.resolve();
    if (!this.isDirty()) return Promise.resolve();
    let keys = Object.keys(this.models);
    let file = keys.reduce((a, b) => {
      a[b] = this.models[b].extract();
      return a;
    }, {});
    return this.entityNodeService.persistEntityNodes(this.dataPath, file)
      .then(_ => this.markAllCurrent());
  }

  private loadModels = (models: {[model: string]: EntityNode[]}) => {
    let keys = Object.keys(models);
    for (var i = 0; i < keys.length; i++) {
      let model = this.models[keys[i]];
      if (!model) continue;
      model.load(models[keys[i]]);
    }
  }

  private loadUnsetModels = () => {
    let keys = Object.keys(this.models);
    let unsetModels = keys.filter(key => this.models[key].state == 'unset');    
    for (var i = 0; i < unsetModels.length; i++) {
      this.models[unsetModels[i]].load([]);
    }
  }

  private markAllCurrent = () => {
    let keys = Object.keys(this.models);
    for (var i = 0; i < keys.length; i++) {
      this.models[keys[i]].markCurrent();
    }
  }

  private isDirty = () => {
    let keys = Object.keys(this.models);
    return keys.reduce((a, b) => {
      let dirty = this.models[b].state == 'dirty';
      return a || dirty;
    }, false);
  }

}