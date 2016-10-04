const path = require('path');
const fs = require('fs');

const mockObjs = {};

const removeFromCache = toRemove =>
    delete require.cache[require.resolve(toRemove)];

module.exports = (parentDir, isInternal) => {
    if(!isInternal) {
        // we have to define this here :(
        const reset = (relativeMockPath, cb) => {
            const innerFunc = new Promise((resolve, reject) => {
                const absMockPath = path.resolve(parentDir, relativeMockPath);
                delete mockObjs(absMockPath);
                fs.rename(absMockPath + '.tfitemp', absMockPath, err => {
                    if(err) return reject(err);
                    removeFromCache(absMockPath);
                    resolve();
                });
            });

            if(!cb) return innerFunc;
            innerFunc.then(cb, cb);
        };
        return {
            mock: (relativeMockPath, mockObj, cb) => {
                // I know this isn't really a function and the naming is therefore wrong but I don't care
                const innerFunc = new Promise((resolve, reject) => {
                    const absMockPath = path.resolve(parentDir, relativeMockPath);
                    mockObjs[absMockPath] = mockObj;
                    fs.rename(absMockPath, absMockPath + '.tfitemp', (err) => {
                        if(err) return reject(err);
                        fs.writeFile(absMockPath,
                            `module.exports = (require('${__filename}')(__filename, true).getExports())`,
                            err => {
                                if(err) return reject(err);
                                removeFromCache(absMockPath);
                                resolve();
                            }
                        )
                    });
                });

                // use promise
                if(!cb) return innerFunc;
                // use traditional callback style
                innerFunc.then(cb, cb);
            },
            reset: reset,
            resetAll: cb => {
                const thingies = [];
                Object.keys.forEach(cur => thingies.push(reset(cur)));
                // conventions, my old friend
                const innerFunc = Promise.all(thingies);

                if(!cb) return innerFunc;
                innerFunc.then(cb, cb);
            },
        };
    }
    // this is being called from within a mocked file
    return {
        getExports: () => mockObjs[parentDir],
    };
}
