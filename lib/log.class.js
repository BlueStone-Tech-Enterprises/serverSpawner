/************************
 * serverSpawner - 2016
 * Create and control garrysmod servers from nodeJS
 *
 * James R Swift, (c) 2016
************************/

"use strict";

const util = require('util');
const Event = require('events').EventEmitter;
const spawn = require('child_process').spawn;

class ServerLogTail{
	
	constructor( serverLogFileName ){
		
		this.process = null;
		this.logFileName = serverLogFileName;

		this.createProcess();
		
	}

	getProcess( ){
		return this.process;
	}
	
	createProcess( ){

		console.log('Logging ' + this.logFileName);

		this.process = spawn("tail",
			['-f ' + this.logFileName],
			{stdio:'pipe'}
		);

		this.emit('processCreated', this.getProcess());
		
		this.process.stdout.on('data', (data) => {
			this.emit('output', data.toString('utf8'));
		});

		this.process.stderr.on('data', (data) => {
			console.log('OMG ERROR IN LOGGER I KNEW IT : ' + data.toString('utf8'));
		});
	}
	
	closeProcess( ){
		this.process.kill();
	}
	
};

util.inherits( ServerLogTail, Event );

module.exports = ServerLogTail;
