import 'mocha';
import { expect } from 'chai';
import { Repository } from './repository';

describe('Repository', () => {

  let repository: Repository<SampleData>;

  beforeEach(() => {
    repository = new Repository();
    repository.setNodes([]);
  })
  
  it('repository state should be unset', () => {
    let repository = new Repository<SampleData>();
    expect(repository.state).to.equal('unset');
  });
  
  it('repository state should be current', () => {
    expect(repository.state).to.equal('current');
  });

  it('get should return entities', () => {
    repository.setNodes([{key: '1', value: new SampleData()}]);
    expect(repository.getNodes().length).to.equal(1);
  });

  it('where should return values that match filter', () => {
    let sample = [
      {key: '1', value: new SampleData()},
      {key: '2', value: new SampleData()}
    ];
    sample[0].value.foo = 'foo1';
    repository.setNodes(sample);
    let result = repository.where(item => item.foo == 'foo1');
    expect(result.length).to.equal(1);
  });

  it('add should create new entity', () => {
    repository.add('1', new SampleData());
    expect(repository.getNodes().length).to.equal(1);
  });

  it('add should mark repository as dirty', () => {
    repository.add('1', new SampleData());
    expect(repository.state).to.equal('dirty');
  });

  it('add should throw error when duplicate key found', () => {
    repository.add('1', new SampleData());
    expect(() => { repository.add('1', new SampleData()); }).to.throw();
  });

  it('markCurrent should set state to current', () => {
    repository.add('1', new SampleData());
    repository.markCurrent();
    expect(repository.state).to.equal('current');
  });

});

class SampleData {
  foo: string;
  bar: string;
}