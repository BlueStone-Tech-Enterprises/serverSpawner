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

const srcdsLocation = "garrysmod/srcds_run";
const _DEBUG = true;

var Messages = [];
const WorkerEventStdOut = function(data){
	Messages[this._process.sb_id] = Messages[this._process.sb_id] || "";
	for (var i=0; i<data.length; i+=1){
		if (data.charCodeAt(i)===255){
			this._process.sb_listener.OnMessage(scon.decode(Messages[this._process.sb_id]).result,this._process);
			Messages[this._process.sb_id] = "";
		}else{
			Messages[this._process.sb_id] += data[i];
		}
	}
};

class Server{
	
	constructor( name, map, gamemode, playerCount, port, ip, rconPassword ){
		
		this.debug( "Creating new instance for server" );
		
		this.process = null;
		this.commandBuffer = [];
		this.outputCount = 0;
		this.outputBuffer = [];
		this.options = []
		this.events = new EventEmitter();
		
		this.createOptions(name, map, gamemode, playerCount, port, ip, rconPassword);
		this.createProcess();
		
	}
	
	emit(){
		this.events.emit(arguments);
	}
	
	debug( output ){
		if ( _DEBUG ){
			process.stdout.write('[ServerSpawner:DEBUGR] '.green);
			console.log( output );
		}
	}

	output( output ){
		process.stdout.write('[ServerSpawner:OUTPUT] '.blue);
		console.log( output );
	}
	
	output( output ){
		process.stdout.write('[ServerSpawner:!ERROR] '.red);
		console.log( output );
	}
	
	getProcess(){
		return this.process;
	}
	
	createOptions(name, map, gamemode, playerCount, port, ip, rconPassword){
		
		var preOptions = [];
		preOptions.push('-game garrysmod');
		preOptions.push('+map ' + map ? map : 'gm_construct');
		//preOptions.push('-autoupdate');
		preOptions.push('+hostname ' + name ? name : 'NodeJS Server Instance');
		preOptions.push('+sv_gamemode ' + gamemode ? gamemode : 'sandbox');
		preOptions.push('+maxplayers ' + playerCount ? playerCount : '16');
		preOptions.push('+port ' + port ? port : '27015');
		preOptions.push('+rcon_password ' + rconPassword);
		
		this.rconPassword = rconPassword;
		this.port = port ? port : '27015';
		
		this.options = preOptions.join(' ');
		this.debug('Filled options table for SrcDS');
	}
	
	createProcess(){
		this.process = spawn(srcdsLocation, this.options, {stdio:['inherit', 'pipe', 'pipe']});
		this.debug('Created process for SrcDS');
		this.emit('processCreated', this.getProcess());
		
		this.process.stdout.on('data', (data) => {
			for (var i=0; i<data.length; i+=1){
				if (data.charCodeAt(i)===12){
					this.processOutput(this.outputBuffer[this.outputCount]);
					this.outputCount++;
					this.outputBuffer[this.outputCount] = "";
				}else{
					this.outputBuffer[this.outputCount] += data[i];
				}
			}
		});
	}
	
	processOutput(sOutput){
		this.output( sOutput );
		this.emit('output',sOutput);
		if ( sOutput == "VAC secure mode is activated." ){
			this.emit('serverReady');
			this.debug('Server is fully functional');
		}
	}
	
}

var server = new Server("test", null, null, null, 27015, '0.0.0.0.', 'testing');
