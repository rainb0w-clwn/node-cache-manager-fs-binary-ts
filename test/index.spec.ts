import {existsSync, readFileSync, rmdirSync} from 'fs';
import {readdir} from 'fs/promises';

import {FsBinaryStore, fsBinaryStore} from '../src';

import spyOn = jest.spyOn;

const cacheDirectory = 'test/customCache';
const store = fsBinaryStore;
describe('test for the hde-disk-store module', function () {

  let s: FsBinaryStore;
  // remove test directory after run
  afterEach((done) => {
    // create a test store
    s = store({path: cacheDirectory, preventfill: true});

    // cleanup all entries in the cache
    expect(
      s.cleancache().finally(() => {
        setTimeout(() => {
          rmdirSync(s.options.path);
          done();
        });
      }),
    ).resolves.not.toThrowError();

  });

  describe('construction', () => {
    it('simple create cache test', () => {
      // create a store with default values
      const s = store();
      // remove folder after testrun
      // check the creation result
      expect(typeof s).toBe('object');
      expect(typeof s.options).toBe('object');
      expect(() => existsSync(s.options.path)).toBeTruthy();
    });

    it('create cache with option path test', () => {
      // create a store
      const s = store({path: cacheDirectory, preventfill: true});
      // check path option creation
      expect(typeof s).toBe('object');
      expect(typeof s.options).toBe('object');
      expect(() => existsSync(s.options.path)).toBeTruthy();
      expect(s.options.path).toEqual(cacheDirectory);
    });
  });

  describe('get', () => {

    it('simple get test with not existing key', (done) => {
      const s = store({path: cacheDirectory, preventfill: true});
      s.get('asdf').then((data) => {
        expect(data).toBeUndefined();
        done();
      });
    });

    describe('test missing file on disk', () => {
      it('filename empty', (done) => {
        const s = store({path: cacheDirectory, preventfill: true});
        expect(
          s.set('test', 'test')
            .then(() => {
              const tmpfilename = s.collection['test'].filename;
              s.collection['test'].filename = null as any;
              expect(s.get('test')).rejects.toThrowError();
              s.collection['test'].filename = tmpfilename;
              expect(s.get('test').finally(() => done())).resolves.not.toThrowError();
            }),
        ).resolves.not.toThrowError();
      });

      it('file does not exist', (done) => {
        const s = store({path: cacheDirectory, preventfill: true});
        expect(
          s.set('test', 'test')
            .then(() => {
              const tmpfilename = s.collection['test'].filename;
              s.collection['test'].filename = 'bla';
              expect(s.get('test')).rejects.toThrowError();
              s.collection['test'].filename = tmpfilename;
              expect(s.get('test').finally(() => done())).resolves.not.toThrowError();
            }),
        ).resolves.not.toThrowError();
      });
    });
  });


  it('test expired of key (and also ttl option on setting)', (done) => {
    const s = store({path: cacheDirectory, preventfill: true});
    expect(
      s.set('asdf', 'blabla', -1000)
        .then(() => {
          expect(s.get('test').finally(() => done())).resolves.toBeUndefined();
        }),
    ).resolves.not.toThrowError();
  });

  describe('set', () => {
    it('simple set test', (done) => {
      const s = store({path: cacheDirectory, preventfill: true});
      const data = 'a lot of data in a file';
      expect(
        s.set('asdf', data)
          .then(() => {
            expect(s.get('asdf').then((metaData) => {
              expect(metaData).not.toBeUndefined();
              const data2 = readFileSync(metaData?.value as string);
              expect(data2.toString()).toEqual(data);
              done();
            })).resolves.not.toThrowError();
          }),
      ).resolves.not.toThrowError();
    });
  });

  describe('keys', () => {
    it('simple keys test', (done) => {
      const s = store({path: cacheDirectory, preventfill: true});
      const data = 'just a string with data';
      expect(
        s.set('key123', data)
          .then(() => {
            expect(s.keys().then((keys) => {
              expect(keys).toHaveLength(1);
              expect(keys[0]).toEqual('key123');
              done();
            })).resolves.not.toThrowError();
          }),
      ).resolves.not.toThrowError();
    });
  });

  describe('del / reset',  () => {

    it('simple del test for not existing key',  (done) => {
      const s = store({path: cacheDirectory, preventfill: true});
      expect(s.del('not existing').finally(() => done())).resolves.not.toThrowError();
    });

    it('successfull deletion',  (done) => {
      const s = store({path: cacheDirectory, preventfill: true});
      expect(
        s.set('nix', 'empty')
          .then(() => {
            expect(s.collection['nix']).not.toBeUndefined();
            expect(s.reset().then(() => {
              expect(s.keys()).resolves.toHaveLength(0);
              readdir(s.options.path).then((list) => {
                expect(list.length == 0);
                expect(s.collection['nix']).toBeUndefined();
                done();
              });
            })).resolves.not.toThrowError();
          }),
      ).resolves.not.toThrowError();
    });

    describe('delete errorhandling',  () => {
      it('file not exists',  (done) => {
        const s = store({path: cacheDirectory, preventfill: true});
        expect(
          s.set('test', 'empty')
            .then(() => {
              const fn = s.collection['test'].filename;
              s.collection['test'].filename = s.collection['test'].filename + '.not_here';
              expect(s.del('test').finally(() => {
                s.collection['test'].filename = fn;
                done();
              })).rejects.toThrowError();
            }),
        ).resolves.not.toThrowError();
      });


      it('filename not set',  (done) =>{
        const s = store({path: cacheDirectory, preventfill: true});
        expect(
          s.set('test', 'empty')
            .then(() => {
              const fn = s.collection['test'].filename;
              s.collection['test'].filename = null as any;
              expect(s.del('test').then(() => {
                s.collection['test'].filename = fn;
                done();

              })).resolves.not.toThrowError();
            }),
        ).resolves.not.toThrowError();
      });
    });

    it('reset all',  (done) => {
      const s = store({path: cacheDirectory, preventfill: true});
      expect(
        s.set('test', 'test')
          .then(() => s.set('test2', 'test2'))
          .then(() => {
            expect(s.collection['test']).not.toBeUndefined();
            expect(s.collection['test2']).not.toBeUndefined();
            expect(s.reset().then(() => {
              expect(s.keys()).resolves.toHaveLength(0);
              readdir(s.options.path).then((list) => {
                expect(list.length == 0);
                expect(s.collection['test']).toBeUndefined();
                expect(s.collection['test2']).toBeUndefined();
                done();
              });
            })).resolves.not.toThrowError();
          }),
      ).resolves.not.toThrowError();
    });
  });

  describe('isCacheableValue', () => {
    it('works', () => {
      const s = store({path: cacheDirectory, preventfill: true});
      expect(s.isCacheableValue(null)).toBeFalsy();
      expect(s.isCacheableValue(undefined)).toBeFalsy();
      expect(s.isCacheableValue('string')).toBeTruthy();
      expect(s.isCacheableValue(Buffer.from('string'))).toBeTruthy();
      expect(s.isCacheableValue({binary: {}})).toBeTruthy();
    });
  });

  describe('zip test', () => {
    it('save and load again', (done) => {
      // create store
      const s = store({path: cacheDirectory, preventfill: true, zip: true});
      const datastring = 'bla only for test \n and so on...';
      const dataKey = 'zipDataTest';
      const zipSpy = spyOn(s, 'zipIfNeeded');
      const unzipSpy = spyOn(s, 'unzipIfNeeded');
      expect(
        s.set(dataKey, datastring)
          .then(() => {
            expect(zipSpy).toBeCalled();
            expect(s.get(dataKey).then((metaData) => {
              expect(unzipSpy).toBeCalled();
              expect(metaData).not.toBeUndefined();
              const data2 = readFileSync(metaData?.value as string);
              expect(data2.toString()).toEqual(datastring);
              done();
            })).resolves.not.toThrowError();
          }),
      ).resolves.not.toThrowError();
    });
  });

  describe('integrationtests', () => {
    it('cache initialization on start', (done) => {
      // create store
      const s = store({path: cacheDirectory, preventfill: true});
      // save element
      expect(s.set('RestoreDontSurvive', 'data', -1)
        .then(() => s.set('RestoreTest', 'test'))
        .then(() => {
          const t = store({
            path: cacheDirectory, fillcallback: () => {
              t.get('RestoreTest')
                .then((metaData) => {
                  expect(metaData).not.toBeUndefined();
                  const data = readFileSync(metaData?.value as string);
                  expect(data.toString()).toEqual('test');
                })
                .then(() => t.get('RestoreDontSurvive'))
                .then((metaData) => {
                  expect(metaData).toBeUndefined();
                  expect(s.currentsize > 0).toBeTruthy();
                })
                .finally(() => {
                  done();
                });
            },
          });
        }),
      ).resolves.not.toThrowError();
    });

    it('cache initialization on start with zip option', (done) => {
      const s = store({path: cacheDirectory, zip: true, preventfill: true});
      // save element
      expect(s.set('RestoreDontSurvive', 'data', -1)
        .then(() => s.set('RestoreTest', 'test'))
        .then(() => {
          const t = store({
            path: cacheDirectory, zip: true, fillcallback: () => {
              t.get('RestoreTest')
                .then((metaData) => {
                  expect(metaData).not.toBeUndefined();
                  const data = readFileSync(metaData?.value as string);
                  expect(data.toString()).toEqual('test');
                })
                .then(() => t.get('RestoreDontSurvive'))
                .then((metaData) => {
                  expect(metaData).toBeUndefined();
                  expect(s.currentsize > 0).toBeTruthy();
                })
                .finally(() => {
                  done();
                });
            },
          });
        }),
      ).resolves.not.toThrowError();
    });

    it('max size option', async () => {
      const s = store({path: cacheDirectory, preventfill: true, maxsize: 1});
      await expect(
        s.set('one', 'dataone'),
      ).rejects.toThrowError('Item size too big.');
      expect(Object.keys(s.collection).length).toEqual(0);

      await expect(
        s.set('x', 'x', -1),
      ).rejects.toThrowError('Item size too big.');
      expect(Object.keys(s.collection).length).toEqual(0);

      s.options.maxsize = 400;

      await expect(
        s.set('a', 'a', 10000),
      ).resolves.not.toThrowError();
      expect(Object.keys(s.collection).length).toEqual(1);

      await expect(
        s.set('b', 'b', 100),
      ).resolves.not.toThrowError();
      expect(Object.keys(s.collection).length).toEqual(2);

      await expect(
        s.set('c', 'c', 100),
      ).resolves.not.toThrowError();
      expect(Object.keys(s.collection).length).toEqual(2);


      await expect(
        s.get('a')
          .then((metaData) => {
            expect(metaData).not.toBeUndefined();
            const data = readFileSync(metaData?.value as string);
            expect(data.toString()).toEqual('a');
          })
          .then(() => s.get('b'))
          .then((metaData) => {
            expect(metaData).toBeUndefined();
            expect(Object.keys(s.collection).length).toEqual(2);
          }),
      ).resolves.not.toThrowError();
    });
  });
})
;
