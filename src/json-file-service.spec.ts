import 'mocha';
import * as sinon from "sinon";
import { expect } from 'chai';
import { JsonFileService } from './json-file-service';

describe('JsonFileService', () => {

  it('getJson should throw exception', (done) => {
    let service = new JsonFileService();
    service._fs.readFile = sinon.stub();
    service._fs.readFile.yields(new Error("NA"));
    service.getEntityNodes("").catch(_ => done());
  });

  it('getJson should return json object', (done) => {
    let service = new JsonFileService();
    service._fs.readFile = sinon.stub();
    service._fs.readFile.yields(null, "{\"foo\": \"bar\"}");
    service.getEntityNodes("").then(rslt => {
      expect(rslt.foo).to.equal("bar");
      done();
    })
  });

  it('writeJson should throw exception', (done) => {
    let service = new JsonFileService();
    service._fs.writeJson = sinon.stub();
    service._fs.writeJson.yields(new Error("NA"));
    service.persistEntityNodes("", {}).catch(_ => done());
  });

  it('writeJson should return void promise', (done) => {
    let service = new JsonFileService();
    service._fs.writeFile = sinon.stub();
    service._fs.writeFile.yields(null);
    service.persistEntityNodes("", {}).then(_ => {
      done();
    })
  });

});