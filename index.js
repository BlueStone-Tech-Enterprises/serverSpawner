#!/usr/bin/nodejs
/************************
 * serverSpawner - 2016
 * Create and control garrysmod servers from nodeJS
 *
 * James R Swift, (c) 2016
************************/

"use strict";

const Server = require('./lib/server.class.js');

var server = new Server("test", "gm_construct", "sandbox", 16, 27015, '0.0.0.0', 'testing');
