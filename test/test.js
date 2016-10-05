// I know the stuff in this file isn't all good unit testing practice.
// I'm fine with that, this is a small project so it doesn't really matter.

// whoever came up with this needs to see a doctor
const tape = require('tape');
const tapes = require('tapes');
const test = tapes(tape);
const fs = require('fs');

test('everything', t => {

    t.beforeEach(t => {
        const boopContents = fs.readFileSync(__dirname + '/boop.js.test');
        fs.writeFileSync(__dirname + '/boop.js', boopContents);
        t.end();
    });

    t.test('boop.js should be default by default', t => {
        const boop = require('./boop.js');
        t.equal(boop(), 'yap');
        t.equal(boop.clap, true);
        t.ok(typeof boop === 'function');
        t.end();
    });

    t.test('basic mocking', t => {
        // this test makes sure that it actually mocks, and also clears cache
        const beforeBoop = require('./boop.js');
        t.equal(beforeBoop(), 'yap');
        require('../index.js')(__dirname).mock('./boop.js', {fake: true}).then(() => {
            const afterBoop = require('./boop.js');
            t.equal(afterBoop.fake, true);
            t.notEqual(afterBoop.clap, true);
            t.equal(typeof afterBoop, 'object');
            t.end();
        });
    });

    t.test('function mocking', t => {
        require('../index.js')(__dirname).mock('./boop.js', h => h + 2).then(() => {
            const boop = require('./boop.js');
            t.equal(typeof boop, 'function');
            t.equal(boop(5), 7);
            t.end();
        });
    });

    t.test('basic reset', t => {
        const tfi = require('../index.js')(__dirname);
        tfi.mock('./boop.js', {fake: true}).then(() => {
            const beforeBoop = require('./boop.js');
            t.equal(beforeBoop.fake, true);
            tfi.reset('./boop.js').then(() => {
                const afterBoop = require('./boop.js');
                t.equal(afterBoop(), 'yap');
                t.end();
            });
        });
    });

    t.test('multi reset', t => {
        const tfi = require('../index.js')(__dirname);
        const boopContents = fs.readFileSync(__dirname + '/boop.js.test');
        fs.writeFileSync(__dirname + '/yoop.js', boopContents);

        tfi.mock('./boop.js', {fake: true})
        .then(() => tfi.mock('./yoop.js', {cat: 'axel'}))
        .then(() => {
            t.equal(require('./boop.js').fake, true);
            t.equal(require('./yoop.js').cat, 'axel');
            return tfi.resetAll();
        })
        .then(() => {
            t.equal(require('./boop.js')(), 'yap');
            t.equal(require('./yoop.js').clap, true);
            // just in case
            t.notEqual(require('./yoop.js').cat, 'axel');
            t.end();
        });
    });

    t.test('callback', t => {
        const tfi = require('../index.js')(__dirname);
        tfi.mock('./boop.js', {fake: true}, err => {
            t.notOk(err);
            t.equal(require('./boop.js').fake, true);
            t.end();
        });
    });

    t.test('absolute path', t => {
        const tfi = require('../index.js')(__dirname);
        tfi.mock(__dirname + '/boop.js', {fake: 'gotcha'}).then(() => {
            t.equal(require('./boop.js').fake, 'gotcha');
            t.end();
        });
    })

    t.end();

});
