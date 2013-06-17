var express = require('express')
	, app = express()
	, server = require('http').createServer(app)
	, path = require('path')
	, io = require('socket.io').listen(server)
	, spawn = require('child_process').spawn
	

	
// all environments
app.set('port', process.env.TEST_PORT || 1330);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname,'public')));

// Routes
app.get('/',function(req,res){
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/remote',function(req,res){
	res.sendfile(__dirname + '/public/remote.html');
});

// Socket.io config
io.set('log level',1);


server.listen(app.get('port'),function(){
	console.log('Express server listening on port ' + app.get('port'));
}); 

// Run pipe shell script output
function run_shell(cmd,args,cb,end){
	var spawn = require('child_process').spawn,
		child = spawn(cmd, args),
		me = this;
	child.stdout.on('data',function(buffer){
		cb(me,fuffer)
	});
	child.stdout.on('end',end);
}

// Save the screen socket in the variable
var ss;

// Socket.io Server
io.sockets.on('connection', function (socket) {
  
	socket.on("screen",function(data){
		socket.type = "screen";
		ss = socket;
		console.log("Screen ready");
	});
	
	socket.on("remote",function(socket){
		socket.type = "remote";
		console.log("Remote ready");
	});
	
	socket.on("youtube",function(hello){
		console.log("Youtube activated");
		console.log(hello);
	});
	
	socket.on("photobeamer",function(hello){
		console.log("phtobeamer activated");
		//chromium --kiosk https://photobeamer.com/
		var runShell = new runShell('chromium',['--kiosk','https://photobeamer.com/'],
			function(me,buffer){
				me.stdout += buffer.toString();
				console.log(me.stdout);
			},
			function(){
			});
		
	});
	
	socket.on("control1",function(data){
		console.log(data);
		if(socket.type === "remote"){
			if(data.action === "tap"){
				if(ss != undefined){
					ss.emit("controlling",{action:"enter"});
				}
			}
			else if(data.action === "swipeLeft"){
				if(ss != undefined){
					ss.emit("controlling",{action:"goLeft"});
				}
			}
			else if(data.action === "swipeRight"){
				if(ss != undefined){
					ss.emit("controlling",{action:"goRight"});
				}
			}
		}
	});
	
	
	socket.on("video",function(data){
		if(data.action === "play"){
			var id = data.video_id,
			url = "http://www.youtube.com/watch?v="+id;
			var runShell = new runShell('youtube-dl',['-o','%(id)s.%(ext)s','-f','/18/22',url],
				function(me,buffer){
					me.stdout += buffer.toString();
					socket.emil("loading",{output: me.stdout});
					console.log(me.stdout);
				},
				function(){
					omx.start(id+'.mp4');
				}
			);
		}
	});
});