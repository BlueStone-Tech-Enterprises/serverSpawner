/************************
 * serverSpawner - 2016
 * Create and control garrysmod servers from nodeJS
 *
 * James R Swift, (c) 2016
************************/

"use strict";

const spawn = require('child_process').spawn;
const colors = require('colors');
const logger = require('./log.class.js');
const util = require('util');
const Event = require('events').EventEmitter;
const fs = require('fs');

const __readyOutput = "VAC secure mode is activated.";
const __srcdsLocation = "./srcds_linux";
const __DEBUG = true;
const __CONSOLE_LOG_FILE = "garrysmod/garrysmod/console.log";

class Server{
	
	constructor( name, map, gamemode, playerCount ){
		
		// Setup variables for use later in program
		this.process = null;
		this.commandBuffer = [];
		this.options = []
		
		// Notification that the server class constructor has been called
		console.log( "" ); //newline
		this.debug( "Creating new instance for server" );

		// Start the srcds_linux process as a child
		this.createOptions(name, map, gamemode, playerCount);
		this.createProcess();
		this.createLogTail( )
		
	}
	
	// Debugging information that can later be excluded from program
	debug( output ){
		if ( __DEBUG ){
			process.stdout.write('[ServerSpawner:DEBUGR] '.green);
			console.log( output );
		}
	}
	
	// Output from SrcDS child process that isn't an error
	output( output ){
		process.stdout.write('[ServerSpawner:OUTPUT] '.blue);
		console.log( output );
	}
	
	// Output from SrcDS that is an error
	output( output ){
		process.stdout.write('[ServerSpawner:!ERROR] '.red);
		console.log( output );
	}
	
	// Utility function to get child process object
	getProcess(){
		return this.process;
	}

	createLogTail( ){
		this.logTail = new logger( __CONSOLE_LOG_FILE );
		this.logTail.on('output', (data)=>{this.processOutput(data)});
	}
	
	// Utility function that converts parameters into arguments for srcds
	createOptions(name, map, gamemode, playerCount, port, ip, rconPassword){
		
		var preOptions = [];
		preOptions.push('-game garrysmod');
		preOptions.push('+map ' + map);
		preOptions.push('+hostname ' + name);
		preOptions.push('+sv_gamemode ' + gamemode);
		preOptions.push('+maxplayers ' + playerCount);
		preOptions.push('-autoupdate');
		
		// LOG
		preOptions.push('-condebug');

		//preOptions.push('+con_logfile ' + __CONSOLE_LOG_FILE );
		
		this.options = [preOptions.join(' ')];
		this.debug('Filled options table for SrcDS');
		
	}
	
	// Create the srcds_linux child process
	createProcess(){

		// Add the current directory and the bin library to the loading paths
		process.env.LD_LIBRARY_PATH = ".:bin:" + process.env.LD_LIBRARY_PATH;
		this.process = spawn(__srcdsLocation, this.options, {
			stdio:['inherit', 'pipe', 'pipe'], 
			cwd:"garrysmod",
		});

		// The process has been created without errors
		this.debug('Created process for SrcDS');
		this.emit('processCreated', this.getProcess());
		

		// Catch output from child process (NOT FUNCTIONAL)
		this.process.stdout.on('data', (data) => {
			this.processOutput(data.toString('utf8'));
		});

		this.process.on('exit', ()=>{this.destroyProcess()});

	}
	
	// Read the output for messages that relate to events or information.
	processOutput(sOutput){
		
		this.output( sOutput );
		this.emit('output',sOutput);
		
		// This is output when the server has loaded
		if ( sOutput == __readyOutput ){
			this.emit('serverReady');
			this.debug('Server is fully functional');
		}
		
	}

	destroyProcess( exitCode ){
		this.logTail.closeProcess();
		fs.truncate(__CONSOLE_LOG_FILE, 0, ()=>{});
	}
	
};

util.inherits( Server, Event );

module.exports = Server;
