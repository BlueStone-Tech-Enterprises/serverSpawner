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
const fs = require('fs');

class ServerLogTail{
	
	constructor( serverLogFileName ){
		
		this.process = null;
		this.logFileName = serverLogFileName;
		this.logFileLastLength = 0;

		this.createProcess();
		
	}

	getProcess( ){
		return this.process;
	}
	
	createProcess( ){
		
		// Callback when mtime changes on file
		fs.watchFile(this.logFileName, {interval:1}, (curr, prev) => {
			var file = fs.readFileSync( this.logFileName, {encoding:'utf8'});
			this.fileUpdated( file.slice( this.logFileLastLength, file.length ) );
			this.logFileLastLength = file.length;
		});

	}
	
	fileUpdated( updated ){
		updated.split("\r\n").forEach((element)=>{
			this.emit('output', element);
		});
	}
	
	closeProcess( ){
		fs.unwatchFile(this.logFileName);
	}
	
};

util.inherits( ServerLogTail, Event );

module.exports = ServerLogTail;
