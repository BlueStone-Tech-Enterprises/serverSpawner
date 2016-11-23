#!/usr/bin/nodejs
/************************
 * serverSpawner - 2016
 * Create and control garrysmod servers from nodeJS
 *
 * James R Swift, (c) 2016
************************/

const spawn = require('child_process').spawn;
const EventEmitter = require('events');
const colors = require('colors');
const intercept = require("intercept-stdout");

const __readyOutput = "VAC secure mode is activated.";
const __srcdsLocation = "./srcds_linux";
const __DEBUG = true;

class Server{
	
	constructor( name, map, gamemode, playerCount, port, ip, rconPassword ){
		
		// Setup variables for use later in program
		this.process = null;
		this.commandBuffer = [];
		this.options = []
		this.events = new EventEmitter();
		
		// Notification that the server class constructor has been called
		console.log( "" ); //newline
		this.debug( "Creating new instance for server" );

		// Start the srcds_linux process as a child
		this.createOptions(name, map, gamemode, playerCount, port, ip, rconPassword);
		this.createProcess();
		
	}
	
	// Used for notifying programmer of events
	emit(){
		this.events.emit(arguments);
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
	
	// Utility function that converts parameters into arguments for srcds
	createOptions(name, map, gamemode, playerCount, port, ip, rconPassword){
		var preOptions = [];
		preOptions.push('-game garrysmod');
		preOptions.push('+map ' + map);
		preOptions.push('+hostname ' + name);
		preOptions.push('+sv_gamemode ' + gamemode);
		preOptions.push('+maxplayers ' + playerCount);
		preOptions.push('+port ' + port);
		preOptions.push('+rcon_password ' + rconPassword);
		preOptions.push('-autoupdate');
		
		this.rconPassword = rconPassword;
		this.port = port ? port : '27015';
		
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
	
}

var server = new Server("test", "gm_construct", "sandbox", 16, 27015, '0.0.0.0', 'testing');
