const path = require('path');
const fs = require('fs-extra');

const mockObjs = {};

module.exports = parentDir =>
    {
        mock: (relativeMockPath, mockObj) =>
            new Promise((resolve, reject) => {
                let absMockPath;
                try {
                    absMockPath = path.resolve(parentDir, relativeMockPath);
                    mockObjs[absMockPath] = mockObj;
                } catch (e) {
                    reject(e);
                }
                fs.rename(absMockPath, absMockPath + '.tfitemp', (err, res) => {
                    if(err) return reject(err);

                }
            }),
    }
