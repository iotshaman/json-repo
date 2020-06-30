import { EntityNode } from './entity-node';

export class Repository<T> {

  private _state: string = 'unset';
  get state(): string { return this._state; };
  private data: {[key: string]: T} = {};

  set = (data: EntityNode[]): void => {
    this.data = {};
    for (var i = 0; i < data.length; i++) {
      this.data[data[i].key] = data[i].value;
    }
    this.markCurrent();
  }

  get = (): EntityNode[] => {
    var keys = Object.keys(this.data);
    return keys.map(key => { return {key: key, value: this.data[key]} });
  }

  find = (key: string) => {
    return this.data[key];
  }

  where = (filter: (item: T) => boolean): T[] => {
    return this.get().map(rslt => rslt.value).filter(filter);
  }

  add = (key: string, item: T) => {
    if (this.data[key]) throw new Error(`Item with key '${key}' already exists.`);
    this.data[key] = item;
    this._state = 'dirty';
  }

  upsert = (key: string, item: T) => {
    this.data[key] = item;
    this._state = 'dirty';
  }

  update = (key: string, item: T) => {
    if (!this.data[key]) throw new Error(`Item with key '${key}' does not exist.`);
    this.data[key] = item;
    this._state = 'dirty';
  }

  delete = (key: string) => {
    if (!this.data[key]) throw new Error(`Item with key '${key}' does not exist.`);
    delete this.data[key];
    this._state = 'dirty';
  }

  markCurrent = () => {
    this._state = 'current';
  }

}