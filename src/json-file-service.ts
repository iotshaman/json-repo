import * as fs from 'fs';
import { EntityNode } from './entity-node';
import { IEntityNodeService } from './entity-node-service';

export class JsonFileService implements IEntityNodeService {

  _fs: any = fs;

  getEntityNodes(path: string): Promise<{[model: string]: EntityNode[]}> {
    return new Promise((res, err) => {
      this._fs.readFile(path, 'utf-8', (ex, data) => {
        if (ex) return err(new Error(ex.message));
        res(JSON.parse(data));
      })
    });
  }

  persistEntityNodes<T>(path: string, data: T): Promise<void> {
    return new Promise((res, err) => {
      let contents = JSON.stringify(data);
      this._fs.writeFile(path, contents, (ex) => {
        if (ex) return err(new Error(ex.message));
        res();
      })
    });
  }

}