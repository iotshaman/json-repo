import * as fs from 'fs';

export interface IJsonFileService {
  getJson<T>(path: string): Promise<T>;
  writeJson<T>(path: string, data: T): Promise<void>;
}

export class JsonFileService implements IJsonFileService {

  _fs: any = fs;

  getJson<T>(path: string): Promise<T> {
    return new Promise((res, err) => {
      this._fs.readFile(path, 'utf-8', (ex, data) => {
        if (ex) return err(new Error(ex.message));
        res(JSON.parse(data));
      })
    });
  }

  writeJson<T>(path: string, data: T): Promise<void> {
    return new Promise((res, err) => {
      let contents = JSON.stringify(data);
      this._fs.writeFile(path, contents, (ex) => {
        if (ex) return err(new Error(ex.message));
        res();
      })
    });
  }

}