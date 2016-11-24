/************************
 * serverSpawner - 2016
 * Create and control garrysmod servers from nodeJS
 *
 * James R Swift, (c) 2016
************************/

const __serverLogLocation = "";

class ServerLogTail extends require('events'){
	
	constructor( serverLogFileName ){
		
		this.process = null;
		this.logFileName = serverLogFileName;
		
	}
	
	createProcess( ){
		this.process = spawn("tail", ['-f ' + __serverLogLocation + this.logFileName);
		this.emit('processCreated', this.getProcess());
		
		this.process.stdout.on('data', (data) => {
			this.emit(data.toString('utf8'));
		});
	}
	
	closeProcess( ){
		this.process.kill();
	}
	
}