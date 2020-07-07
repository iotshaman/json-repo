import { EntityNode } from './entity-node';

export interface IRepository<T> {
  state: string;
  load: (data: EntityNode[]) => void;
  extract: () => EntityNode[];
  find: (key: string) => T;
  filter: (filter: (item: T) => boolean) => T[];
  add: (key: string, item: T) => void;
  addRange: (items: {key: string, value: T}[]) => void;
  update: (key: string, action: (item: T) => T) => void;
  delete: (key: string) => void;
  markCurrent: () => void;
}

export class Repository<T> implements IRepository<T> {

  get state(): string { return this._state; };
  protected _state: string = 'unset';
  protected data: {[key: string]: T} = {};

  load = (data: EntityNode[]): void => {
    this.data = {};
    for (var i = 0; i < data.length; i++) {
      this.data[data[i].key] = data[i].value;
    }
    this.markCurrent();
  }

  extract = (): EntityNode[] => {
    var keys = Object.keys(this.data);
    return keys.map(key => { return {key: key, value: this.data[key]} });
  }

  find = (key: string) => {
    return this.data[key];
  }

  filter = (filter: (item: T) => boolean): T[] => {
    return this.extract().map(rslt => rslt.value).filter(filter);
  }

  add = (key: string, item: T) => {
    if (this.data[key]) throw new Error(`Item with key '${key}' already exists.`);
    this.data[key] = item;
    this._state = 'dirty';
  }

  addRange = (items: {key: string, value: T}[]) => {
    for (var i = 0; i < items.length; i++) {
      this.add(items[i].key, items[i].value);
    }
  }

  update = (key: string, action: (item: T) => T) => {
    if (!this.data[key]) throw new Error(`Item with key '${key}' does not exist.`);
    this.data[key] = action(this.data[key]);
    this._state = 'dirty';
  }

  upsert = (key: string, item: T) => {
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