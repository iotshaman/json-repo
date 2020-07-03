import 'mocha';
import { expect } from 'chai';
import { Repository } from './repository';

describe('Repository', () => {

  let repository: Repository<SampleData>;

  beforeEach(() => {
    repository = new Repository();
    repository.load([]);
  })
  
  it('repository state should be unset', () => {
    let repository = new Repository<SampleData>();
    expect(repository.state).to.equal('unset');
  });
  
  it('repository state should be current', () => {
    expect(repository.state).to.equal('current');
  });

  it('get should return entities', () => {
    repository.load([{key: '1', value: new SampleData()}]);
    expect(repository.extract().length).to.equal(1);
  });

  it('where should return values that match filter', () => {
    let sample = [
      {key: '1', value: new SampleData()},
      {key: '2', value: new SampleData()}
    ];
    sample[0].value.foo = 'foo1';
    repository.load(sample);
    let result = repository.where(item => item.foo == 'foo1');
    expect(result.length).to.equal(1);
  });

  it('add should create new entity', () => {
    repository.add('1', new SampleData());
    expect(repository.extract().length).to.equal(1);
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

  it('find should return undefined if key does not exist', () => {
    expect(repository.find('1')).to.be.undefined;
  });

  it('find should return value if key exists', () => {
    repository.upsert('1', new SampleData());
    expect(repository.find('1')).not.to.be.undefined;
  });

  it('upsert should create new entity', () => {
    repository.upsert('1', new SampleData());
    expect(repository.find('1')).not.to.be.undefined;
  });

  it('upsert should update existing entity', () => {
    repository.load([{key: '1', value: new SampleData()}]);
    let newValue = new SampleData(); newValue.foo = 'baz';
    repository.upsert('1', newValue);
    expect(repository.find('1').foo).to.equal('baz');
  });

  it('upsert should set state to dirty', () => {
    repository.upsert('1', new SampleData());
    expect(repository.state).to.equal('dirty');
  });

  it('update should throw error when key does not exist', () => {
    expect(() => { repository.update('1', new SampleData()); }).to.throw();
  });

  it('update should update existing entity', () => {
    repository.load([{key: '1', value: new SampleData()}]);
    let newValue = new SampleData(); newValue.foo = 'baz';
    repository.update('1', newValue);
    expect(repository.find('1')).not.to.be.undefined;
  });

  it('update should set state to dirty', () => {
    repository.load([{key: '1', value: new SampleData()}]);
    repository.update('1', new SampleData());
    expect(repository.state).to.equal('dirty');
  });

  it('delete should throw error when key does not exist', () => {
    expect(() => { repository.delete('1'); }).to.throw();
  });

  it('delete should remove existing entity', () => {
    repository.load([{key: '1', value: new SampleData()}]);
    repository.delete('1');
    expect(repository.find('1')).to.be.undefined;
  });

  it('delete should set state to dirty', () => {
    repository.load([{key: '1', value: new SampleData()}]);
    repository.delete('1');
    expect(repository.state).to.equal('dirty');
  });

});

class SampleData {
  foo: string;
  bar: string;
}