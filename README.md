# node-cache-manager-fs-binary-ts [![npm version](https://badge.fury.io/js/cache-manager-fs-binary-ts.svg)](https://www.npmjs.com/package/cache-manager-fs-binary-ts) [![Build Status](https://github.com/rainb0w-clwn/node-cache-manager-fs-binary-ts/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/rainb0w-clwn/node-cache-manager-fs-binary-ts/actions) [![codecov](https://codecov.io/gh/rainb0w-clwn/node-cache-manager-fs-binary-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/rainb0w-clwn/node-cache-manager-fs-binary-ts)

# Node Cache Manager store for filesystem with binary data

Typescript filesystem store for the [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) module,
storing binary data as separate files and returning **their full paths**

After getting the valid file path you can decide on your own how to handle it (sending it as a stream to a consumer,
e.g. `res.send()`, or handle as a buffer).

The library caches on disk arbitrary data, but values of an object under the special key `binary` is stored as separate
files.

## Features

* Based on promises
* Works well with [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager) version >= 5
* Handle file as you want (by getting file full path)
* Limit maximum size on disk
* Refill cache on startup (in case of application restart)
* Can store buffers inside the single metadata-cache file (not keys of the `binary` key)
* Zip metadata-cache files (useful in case storing buffer inside it)

## Installation

```sh
    npm install cache-manager-fs-binary-ts --save
```

### Single store

```typescript
// node cachemanager
import {caching} from 'cache-manager';
// storage for the cachemanager
import {fsBinaryStore, FsBinaryValue} from 'node-cache-manager-fs-binary-ts';

// initialize caching on disk
const diskCache = caching(fsBinaryStore, {
    ttl: 60 * 60 /* seconds */,
    maxsize: 1000 * 1000 * 1000 /* max size in bytes on disk */,
    path: 'diskcache',
    preventfill: true
  }
);

const cacheKey = 'testKey';
const ttl = 60 * 60 * 24 * 7; // in seconds

// wrapper function, see more examples at node-cache-manager
// note that basic node-cache-manager wrap method returns input data as is
// so our set method changes input binaries to be resolved as file paths to match get ones
const result: FsBinaryValue<string> = await diskCache.wrap(cacheKey,
  // called if the cache misses in order to generate the value to cache
  () => {
    let myFileBuffer: Buffer; // buffer that will be saved to separate file
    let moreData = 'string'; // string that will be saved to a separate file
    let metaData = 'string'; // some data too keep inside, any JSON-able data
    let someFileBuffer: Buffer; // small binary data to store inside as buffer

    // now returning value to cache and process further
    // Some JSONable object. Note that null and undefined values not stored.
    // One can redefine isCacheableValue method to tweak the behavior.
    return {
      binary: {
// These will be saved to separate files and returned as file paths
        myFile: myFileBuffer,
        someMoreData: moreData,
      },
// Other (optional) data are saved into the metadata-cache file
      someArbitraryValues: metaData,
      someFilesToKeepInMetaDataCacheFile: {
// While buffer data could be saved to the main file, it is strongly
// discouraged to do so for large buffers, since they are stored in JSON
// as Array of bytes. Use wisely, do the benchmarks, mind inodes, disk
// space and performance balance.
        someFile: someFileBuffer,
      },
    };
  },
  ttl
)

console.log(result)
```

``` typescript
{
  binary: {
    myFile: 'diskcache/{UUID_V4}_myfile.bin', 
    someMoreData: 'diskcache/{UUID_V4}_somemoredata.bin',
  },
  someArbitraryValues: 'string', 
  someFilesToKeepInMetaDataCacheFile: {
    someFile: Buffer
  }
}
```

### Options

```typescript
// default values

// time to live in seconds
options.ttl = 60;
// path for cached files
options.path = 'cache/';
// prevent filling of the cache with the files from the cache-directory
options.preventfill = false;
// callback fired after the initial cache filling is completed
options.fillcallback = null;
// if true the metadata-cache files will be zipped (not the binary ones)
options.zip = false;

```

### Examples

```typescript
// or an object with binary as Buffer
await diskCache.set('key1',
  {
    binary: Buffer.from('string'),
  }
);
// or an object with binary as string
await diskCache.set('key2',
  {
    binary: 'string'
  }
);
// or an object with binary as collection of binary data
await diskCache.set('key3',
  {
    binary: {
      file1: Buffer.from('string'),
      file2: 'string',
    },
    // you can add any other meta information or meta-buffer (any keys allowed)
    meta: {
      size: 100,
      createdAt: new Date(),
    },
    metaBuffer: Buffer.from('string'),
  }
)

```

## License

cache-manager-fs-binary-ts is licensed under the MIT license.

## Credits

Based on:
* https://github.com/hotelde/node-cache-manager-fs
* https://github.com/sheershoff/node-cache-manager-fs-binary
