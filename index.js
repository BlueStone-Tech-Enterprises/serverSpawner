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

const srcdsLocation = "garrysmod/srcds_run";
const _DEBUG = true;

class Server{
	
	constructor( name, map, gamemode, playerCount, port, ip, rconPassword ){
		
		this.debug( "Creating new instance for server" );
		
		this.process = null;
		this.commandBuffer = [];
		this.outputCount = 0;
		this.outputBuffer = [];
		this.options = []
		this.events = new EventEmitter();
		
		this.ignoreIntercept = false;
		this.unhook_intercept = intercept(this.processOutput);
		
		this.createOptions(name, map, gamemode, playerCount, port, ip, rconPassword);
		this.createProcess();
		
	}
	
	emit(){
		this.events.emit(arguments);
	}
	
	debug( output ){
		if ( _DEBUG ){
			this.ignoreIntercept = true;
			process.stdout.write('[ServerSpawner:DEBUGR] '.green);
			console.log( output );
			this.ignoreIntercept = false;
		}
	}

	output( output ){
		this.ignoreIntercept = true;
		process.stdout.write('[ServerSpawner:OUTPUT] '.blue);
		console.log( output );
		this.ignoreIntercept = false;
	}
	
	output( output ){
		this.ignoreIntercept = true;
		process.stdout.write('[ServerSpawner:!ERROR] '.red);
		console.log( output );
		this.ignoreIntercept = false;
	}
	
	getProcess(){
		return this.process;
	}
	
	createOptions(name, map, gamemode, playerCount, port, ip, rconPassword){
		
		var preOptions = [];
		preOptions.push('-game garrysmod');
		preOptions.push('+map ' + map ? map : 'gm_construct');
		//preOptions.push('-autoupdate');
		//preOptions.push('+hostname ' + name ? name : 'NodeJS Server Instance');
		//preOptions.push('+sv_gamemode ' + gamemode ? gamemode : 'sandbox');
		//preOptions.push('+maxplayers ' + playerCount ? playerCount : '16');
		//preOptions.push('+port ' + port ? port : '27015');
		//preOptions.push('+rcon_password ' + rconPassword);
		
		this.rconPassword = rconPassword;
		this.port = port ? port : '27015';
		
		//this.options = [preOptions.join(' ')];
<<<<<<< HEAD
		this.options = ['-game garrysmod +map gm_construct'];
=======
		this.options = ['-game garrysmod +map gm_construct']
>>>>>>> origin/master
		this.debug('Filled options table for SrcDS');
	}
	
	createProcess(){
		this.process = spawn(srcdsLocation, this.options, {stdio:['inherit', 'pipe', 'pipe']});
		this.debug('Created process for SrcDS');
		this.emit('processCreated', this.getProcess());
		
<<<<<<< HEAD
		this.process.stdout.on('data', (data) => {
			processOutput(data.toStirng('utf8'));
=======
		this.process.stdout.on('data', (output) => {
			var data = output.toString('utf8');
			for (var i=0; i<data.length; i+=1){
				if (data.charCodeAt(i)===12){
					this.processOutput(this.outputBuffer[this.outputCount]);
					this.outputCount++;
					this.outputBuffer[this.outputCount] = "";
				}else{
					this.outputBuffer[this.outputCount] += data[i];
				}
			}
>>>>>>> origin/master
		});
	}
	
	processOutput(sOutput){
		if ( !this.ignoreIntercept ){
			this.output( sOutput );
			this.emit('output',sOutput);
			if ( sOutput == "VAC secure mode is activated." ){
				this.emit('serverReady');
				this.debug('Server is fully functional');
			}
			return '';
		})
		return sOutput;
	}
	
}

var server = new Server("test", null, null, null, 27015, '0.0.0.0.', 'testing');
