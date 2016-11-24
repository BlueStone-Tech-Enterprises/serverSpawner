/************************
 * serverSpawner - 2016
 * Create and control garrysmod servers from nodeJS
 *
 * James R Swift, (c) 2016
************************/

const spawn = require('child_process').spawn;
const colors = require('colors');
const logger = require('./log.class.js');

const __readyOutput = "VAC secure mode is activated.";
const __srcdsLocation = "./srcds_linux";
const __DEBUG = true;

class Server extends require('events'){
	
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
		preOptions.push('-autoupdate');
		
		// LOG
		preOptions.push('+log on');                //Creates a logfile (Enable= on Disable= off)
		preOptions.push('+sv_logfile 1');            //Log server information in the log file.
		preOptions.push('+sv_logsdir ' + __dirname);    //Folder in the game directory where server logs will be stored.
		preOptions.push('+sv_logecho 0');            //Echo log information to the console.
		preOptions.push('+sv_log_onefile 1');        //Log server information to only one file.
		preOptions.push('+sv_logbans 1');           //Log server bans in the server logs.
		preOptions.push('+sv_logdownloadlist 1');        //Log files to download.
		
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
	
};

module.exports = Server;
