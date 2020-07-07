import 'mocha';
import * as sinon from "sinon";
import { expect } from 'chai';
import { RepositoryContext } from './repository-context';
import { EntityNode } from './entity-node';
import { Repository } from './repository';
import { JsonFileService } from './json-file-service';
import { IEntityNodeService } from './entity-node-service';

describe('ContextBase', () => {

  let jsonService;
  
  beforeEach(() => {
    jsonService = sinon.createStubInstance(JsonFileService);
  })

  it('initialize should load unset models', (done) => {
    jsonService.getEntityNodes = sinon.stub();
    jsonService.getEntityNodes.returns(Promise.resolve({"sample2": []}));
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => {
      expect(context.models.sample.state).to.equal('current');
      done();
    });
  });

  it('initialize should load models if no file found', (done) => {
    jsonService.getEntityNodes = sinon.stub();
    jsonService.getEntityNodes.returns(Promise.reject());
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => {
      expect(context.models.sample.state).to.equal('current');
      done();
    });
  });

  it('getNodes should return empty array', (done) => {
    let context = new NoopContextBase();
    context.initialize().then(_ => {
      let result: EntityNode[] = context.models.sample.extract();
      expect(result.length).to.equal(0);
      done();
    });
  });

  it('get should return single object', (done) => {
    jsonService.getEntityNodes = sinon.stub();
    let sampleData = {sample: [{key: '1', value: {key: '1', foo: 'a', bar: 'b'}}]}
    jsonService.getEntityNodes.returns(Promise.resolve(sampleData));
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => {
      let result: EntityNode[] = context.models.sample.extract();
      expect(result.length).to.equal(1);
      done();
    });
  });

  it('saveChanges outputs json to jsonService.persistEntityNodes', (done) => {
    jsonService.getEntityNodes = sinon.stub();
    let sampleData = {sample: [{key: '1', value: {key: '1', foo: 'a', bar: 'b'}}]}
    jsonService.getEntityNodes.returns(Promise.resolve(sampleData));
    jsonService.persistEntityNodes.returns(Promise.resolve(sampleData));
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => {
      context.models.sample.update('1', (item => item));
      return context.saveChanges()
    })
    .then(_ => {
      sinon.assert.calledOnce(jsonService.persistEntityNodes);
      done();
    });
  });

  it('saveChanges does nothing when there is no dataPath variable', (done) => {
    jsonService.getEntityNodes = sinon.stub();
    let sampleData = {sample: [{key: '1', value: {key: '1', foo: 'a', bar: 'b'}}]}
    jsonService.getEntityNodes.returns(Promise.resolve(sampleData));
    let context = new NoopContextBase(null, jsonService);
    context.initialize().then(_ => context.saveChanges()).then(_ => {
      sinon.assert.notCalled(jsonService.persistEntityNodes);
      done();
    });
  });

  it('saveChanges does nothing when nothing has changed', (done) => {
    jsonService.getEntityNodes = sinon.stub();
    let sampleData = {sample: [{key: '1', value: {key: '1', foo: 'a', bar: 'b'}}]}
    jsonService.getEntityNodes.returns(Promise.resolve(sampleData));
    let context = new NoopContextBase("inmemory", jsonService);
    context.initialize().then(_ => context.saveChanges()).then(_ => {
      sinon.assert.notCalled(jsonService.persistEntityNodes);
      done();
    });
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
  constructor(dataPath?: string, entityNodeService?: IEntityNodeService) {
    super(dataPath, entityNodeService);
  }
}