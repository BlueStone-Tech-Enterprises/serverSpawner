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

class Server{
    
    constructor( name, map, gamemode, playerCount, port, ip, rconPassword ){
        
        this.debug( "Creating new instance for server" );
        
        this.process = null;
        this.commandBuffer = [];
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
        if ( _DEBUG ){
            process.stdout.write('[ServerSpawner:OUTPUT] '.blue);
            console.log( output );
        }
    }
    
    getProcess(){
        return this.process;
    }
    
    createOptions(name, map, gamemode, playerCount, port, ip, rconPassword){
        
        this.rconPassword = rconPassword;
        this.port = port ? port : '27015';
        
        this.options.push('-game garrysmod +map gm_construct');
        //this.options.push('-autoupdate');
        //this.options.push('-console');
        //this.options.push('+hostname ' + name ? name : 'NodeJS Server Instance');
        //this.options.push('+map ' + map ? map : 'gm_construct');
        //this.options.push('+sv_gamemode ' + gamemode ? gamemode : 'sandbox');
        //this.options.push('+maxplayers ' + playerCount ? playerCount : '16');
        //this.options.push('+port ' + port ? port : '27015');
        //this.options.push('+rcon_password ' + rconPassword);
        
        this.debug('Filled options table for SrcDS');
    }
    
    createProcess(){
        this.process = spawn(srcdsLocation, this.options, {stdio:['inherit', 'pipe', 'pipe']});
        this.debug('Created process for SrcDS');
        this.emit('processCreated', this.getProcess());
        
        this.process.stdout.on('data', (data) => {

            data.toString('utf8').split('\n').forEach((element)=>{
                this.output( data.toString('utf8') );
                this.emit('output', data.toString('utf8'));
                if ( data.toString('utf8') == "VAC secure mode is activated.\n" ){
                    this.emit('serverReady');
                    this.debug('Server is fully functional');
                }
            });
        });
    }
    
}

var server = new Server("test", null, null, null, 27015, '0.0.0.0.', 'testing');
