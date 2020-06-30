import 'mocha';
import * as sinon from "sinon";
import { expect } from 'chai';
import { RepositoryContext } from './repository-context';
import { EntityNode } from './entity-node';
import { Repository } from './repository';
import { JsonFileService, IJsonFileService } from './json-file-service';

describe('ContextBase', () => {

  let jsonService;
  
  beforeEach(() => {
    jsonService = sinon.createStubInstance(JsonFileService);
  })

  it('initialize should load unset models', (done) => {
    jsonService.getJson = sinon.stub();
    jsonService.getJson.returns(Promise.resolve({"sample2": []}));
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => {
      expect(context.models.sample.state).to.equal('current');
      done();
    });
  });

  it('get should return empty array', (done) => {
    let context = new NoopContextBase();
    context.initialize().then(_ => {
      let result: EntityNode[] = context.models.sample.get();
      expect(result.length).to.equal(0);
      done();
    });
  });

  it('get should return single object', (done) => {
    jsonService.getJson = sinon.stub();
    let sampleData = {sample: [{key: '1', value: {key: '1', foo: 'a', bar: 'b'}}]}
    jsonService.getJson.returns(Promise.resolve(sampleData));
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => {
      let result: EntityNode[] = context.models.sample.get();
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('saveChanges outputs json to jsonService.writeJson', (done) => {
    jsonService.getJson = sinon.stub();
    let sampleData = {sample: [{key: '1', value: {key: '1', foo: 'a', bar: 'b'}}]}
    jsonService.getJson.returns(Promise.resolve(sampleData));
    jsonService.writeJson.callsFake((...args) => {
      expect(args.length).to.equal(2);
      expect(args[1].sample).not.to.be.null;
      return Promise.resolve();
    });
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => context.saveChanges()).then(_ => done());
  });
  
})

class SampleData {
  foo: string;
  bar: string;
}
class NoopContextBase extends RepositoryContext {
  models = {
    sample: new Repository<SampleData>()
  }
  constructor(dataPath?: string, jsonFileService?: IJsonFileService) {
    super(dataPath, jsonFileService);
  }
}