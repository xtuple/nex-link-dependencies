'use strict';

var _ = require('lodash');
var nex = require('nex-api');
var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
var proc = require('child_process');
var log = require('npmlog');
var colors = require('colors');

var handler = module.exports = new nex.Handler('linkDependencies');

/**
 * @override
 */
handler.do = function (pkg) {
  _.each(pkg[this.field], function (dir, name) {
    log.info('npm install', name, 'in'.green, dir);
    process.chdir(dir);
    proc.spawnSync('npm',[ 'install', '--no-global' ], { cwd: dir });
    process.chdir(global.cwd);

    let linkName = path.resolve(process.cwd(), 'node_modules', name);
    log.info('link', path.relative(process.cwd(), linkName), '->'.green, dir);

    rimraf.sync(linkName);
    fs.symlinkSync(path.resolve(dir), linkName);
  }, this);
};

/**
 * @override
 */
handler.undo = function (pkg) {
  _.each(pkg[this.field], function (dir, name) {
    process.chdir(dir);
    rimraf.sync('node_modules');
    process.chdir(global.cwd);

    rimraf.sync(path.resolve(process.cwd(), 'node_modules', name));
  }, this);
};
