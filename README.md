## Json File Repository - IoT Shaman

![npm badge](https://img.shields.io/npm/v/json-repo.svg) ![Build Status](https://travis-ci.org/iotshaman/json-repo.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/iotshaman/json-repo/badge.svg?branch=master)](https://coveralls.io/github/iotshaman/json-repo?branch=master)

### In-memory repository with Json file persistence.
Sometimes as developers we have the need to store and retrieve persistent data, but dont need all the power that comes with a traditional data persistence solution. The Json File Repository (json-repo) is an in-memory data repository that conveniently persists data to a Json file, anywhere on the host device. This allows applications to receive the benefits of a repository abstraction, without having to model, provision and connect to, say, a SQL database. When you initialize an implementation of the repository, it will load any data located in the provided file path (if it exists), and when you make changes to the repository simply call "saveChanges()" to persist the data into the Json file.


### Requirements
- Node JS
- Typescript

### Installation
```sh
npm install json-repo --save
```

### Quick Start
Getting started with json-repo is really quick and simple. First, create an a model to provide types for the data we are going to store: For example:

```ts
//file: foo.ts
export class Foo {
  bar: string;
}
```

Next, we need to create an implementation of the base "RepositoryContext" class:

```ts
//file: sample-repository.ts
import { RepositoryContext, Repository } from 'json-repo';
import { Foo } from './foo';

export class SampleRepository extends RepositoryContext {
  constructor(dataPath: string) { super(dataPath); }
  models = {
    baz: new Repository<Foo>()
  }
}
```

Finally, we need to initialize the repository in our application:

```ts
import * as path from 'path';
import { SampleRepository } from './sample-repository';
import { Foo } from './foo';

const jsonFilePath = path.join(__dirname, 'db.json');
let repository = new SampleRepository(jsonFilePath);
repository.initialize().then(_ => {
  //you can now use the repository
  let foo = new Foo(); foo.bar = 'baz';
  repository.models.baz.add('1', foo);
  return repository.saveChanges();
});
```

### API Reference

The below information describes how to use the built-in features of json-repo.

#### RepositoryContext

The "RepositoryContext" is an abstract class that allows you to communicate with various repositories. All repositories in a given implementation will store their data in the same JSON file. The RepositoryContext takes 2 optional arguments in its constructor, that allow you to configure its behavior.

```ts
//provided from the repository-context.d.ts file
export declare abstract class RepositoryContext {
  abstract models: {
    [key: string]: Repository<any>;
  };
  constructor(dataPath?: string, entityNodeService?: IEntityNodeService);
  initialize: () => Promise<void>;
  saveChanges: () => Promise<void>;
}
```

- **models:** the models property stores a collection of repository objects. These repository objects represent your domain objects. Each value in models is a key value pair, with the key being the common name of the domain object, and the value being an implementation of the Repository class, with the generic argument set to the typed class of your domain model.

- **constructor:** the dataPath argument, when provided, tells the repository context where the data file is; when not provided, the repository context will be in-memory only, and as such will not persist the data. The entityNodeService object allows you to provide a custom implementation of IEntityNodeService, which gives you additional control over how and where you persist data; to use the built-in JSON file persistence, do not provide a value for entityNodeService.

- **initialize:** the initialize method will look for any data in the persistent storage layer and load it into memory. If no data is found, the repository context will initialize each repository with a blank array. If a new repository was added and does not yet exist in persistent storage, that repository will be initialized with a blank array.

- **saveChanges:** saveChanges will ask the persistent storage layer to store the contents of the repository. If there was no data path provided to the constructor, or nothing has changed in the repositories, this will be a noop.

#### Repository

The "Repository" class is a generic class, with the type argument representing a domain object. Some built-in methods are provided to manage and query the repository; this class can also be extended, if you wish to provide additional functionality. 

```ts
//provided from the repository.d.ts file
export declare class Repository<T> {
    get state(): string;
    protected _state: string;
    protected data: {
        [key: string]: T;
    };
    load: (data: EntityNode[]) => void;
    extract: () => EntityNode[];
    find: (key: string) => T;
    where: (filter: (item: T) => boolean) => T[];
    add: (key: string, item: T) => void;
    upsert: (key: string, item: T) => void;
    update: (key: string, item: T) => void;
    delete: (key: string) => void;
    markCurrent: () => void;
}
```

#### EntityNode
An "EntityNode" is the core persistent storage block of a repository. When files are written to and read from the persistent storage layer, EntityNode objects are what is used. Entity nodes are simply key value pairs, where the key represents a unique key to store and retrieve data, and a value which contains the concrete domain object. For most implementations, you will never use the EntityNode object, but it can be useful if you are extending the repository class, or needing to wipe or reload the entire repository.

```ts
//provided from the entity-node.d.ts file
export declare class EntityNode {
    key: string;
    value: any;
}
```

#### IEntityNodeService
The implementation of "IEntityNodeService" acts as the persistent storage layer, reading to and writing from some storage mechanism. The built-in implementation of IEntityNodeService is calls "JsonFileService", and is provided by default to all "RepositoryContext" objects. If you wish to provide a custom data persistence solution, you can achieve this by creating a custom implementation of IEntityNodeService.

```ts
export interface IEntityNodeService {
    getEntityNodes(path: string): Promise<{[model: string]: EntityNode[];}>;
    persistEntityNodes<T>(path: string, data: T): Promise<void>;
}
```