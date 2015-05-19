var express = require("express");
var socket = require("socket.io");
var classes = require(__dirname + "/myLib/classes.js");
var tools = require(__dirname + "/myLib/tools.js");
var api = express();
var io = socket.listen(api.listen(8080));

var balls = new Array,fps = 10,lastUpdate = 0,ballsMaxRad = 1000;//fps - количество просчетов в сек
var gamespeed = 1000/fps;
		// balls.push(new classes.ball(300,300,30,"rgb("+tools.randColor()+")",123));
		// balls[0].speed = 0;

var world = {
	x0:0,//left border
	y0:0,//top border
	x1:5000,//right border
	y1: 5000//bottom border
};
var bots = {arr: new Array,limit: 400,r:  5};
for(var i = 0; i < bots.limit; i++){
	bots.arr.push({x:tools.getRandNum(world.x0, world.x1),
			   y: tools.getRandNum(world.y0, world.y1)});
}
api.use(express.static(__dirname+ '/public'));

api.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

function changeRadius(obj,r,check,num){
	if(obj.r >= ballsMaxRad)
		return false;
	if(check)//не бот
		obj.r += r/3;
	else if(obj.r >= 800)
		obj.r += r/100;
	else if(obj.r >= 600)
		obj.r += r/50;
	else if(obj.r >= 400)
		obj.r += r/40;
	else if(obj.r >= 200)
		obj.r += r/35;
	else if(obj.r >= 100)
		obj.r += r/30;
	else if(obj.r >= 50)
		obj.r += r/20;
	else if(obj.r >= 0)
		obj.r += r/10;
	if(balls.length > 0)
	for(var i = num; i < balls.length-1; i++){
		if(balls[i].r > balls[i+1].r){
			var tmp = balls[i];
			balls[i] = balls[i+1];
			balls[i+1] = tmp;
		}
		else
			break;
	}
}
io.sockets.on('connection', function (client) {
		console.log('Connection socket '+client.id);
		client.emit("misc",{id: client.id, world : world, serverFps:fps, botsLimit: bots.limit});
		client.on('angle',function(data){
			for(var i = 0; i < balls.length;i++)
				if(balls[i].id == client.id){
					balls[i].angle = data;
					break;
				}
		});
	client.on('ready',function(data){
			for(var i = 0; i < balls.length;i++)
				if(balls[i].id == client.id){
					balls.splice(i,1);
					break;
				}
			var check = false;
			var loops = 0;
			while(!check && loops<= 200){
				var r = 20;
				var x = tools.getRandNum(world.x0 + r/2,world.x1 - r/2);
				var y = tools.getRandNum(world.y0 + r/2,world.y1 - r/2);
				for(var i = 0; i < balls.length; i++){
					e = balls[i];
					var dist = Math.sqrt(Math.pow(e.x - x,2)+Math.pow(e.y-y,2));
					dist += (e.r > r)?r:e.r;
					var diam = (e.r < r)?r:e.r;
					if(dist < diam)
							break;
					if(i >= balls.length - 1){
						check = true;
						break;
					}
				}
				loops++;
			}
			var tmp = new classes.ball(x,y,r,((data.color)?data.color:"#F00"),client.id);
			tmp.username = (data.username && data.username.length <=20)?data.username:"player";
			if(balls.length > 0)
				for(var i = 0; i < balls.length; i++){
					if(tmp.r < balls[i].r){
						for(var j = balls.length; j > i;j-- ){
							balls[j] = balls[j-1];
						}
						balls[i] = tmp;
						break;
					}
					if(i >= balls.length - 1){
						balls.push(tmp);	
						break;
					}
			}
			else
				balls.push(tmp);			
		});
	client.on("disconnect",function(){
		for(var i = 0; i < balls.length; i++){
			if(balls[i].id == client.id){
				balls.splice(i,1);
				break;
			}				
		}
		console.log('Connection close socket '+client.id);
	});
});
handler();
function handler(){
	var now = Date.now();
	var factor = (now - lastUpdate)/1000;
	lastUpdate =  now;
	balls.forEach(function(e,n){
		for(var i = 0,x = e.x, y = e.y, r = e.r; i < balls.length; i++){
			if(i == n)
				continue;
			if(Math.abs(balls[i].r - r) > 5){
				var dist = Math.sqrt(Math.pow(balls[i].x - x,2)+Math.pow(balls[i].y-y,2));
				dist += (balls[i].r > r)?r:balls[i].r;
				var diam = (balls[i].r < r)?r:balls[i].r;
					if(dist < diam){
							var p = (r > balls[i].r)?{kill: i , win: n}: {kill: n , win : i};
								changeRadius(balls[p.win],balls[p.kill].r,true,n);
								io.sockets.emit("youDie",{id:balls[p.kill].id});
								balls.splice(p.kill,1);
							break;
					}
			}
		}
		e.x += (factor * e.speed) * Math.cos(tools.toRadian(e.angle)); 
		e.y += (factor * e.speed) * Math.sin(tools.toRadian(e.angle));
		if(e.x + e.r > world.x1)
			e.x = world.x1 - e.r;
		if(e.x - e.r < world.x0)
			e.x = world.x0 + e.r;
		if(e.y + e.r > world.y1)
			e.y = world.y1 - e.r;
		if(e.y - e.r < world.x0)
			e.y = world.y0 + e.r;
		for(var i = 0; i < bots.arr.length; i++){
			d = bots.arr[i];
			var dist = Math.sqrt(Math.pow(d.x - x,2)+Math.pow(d.y-y,2)) + bots.r;
				if(dist < r){
					bots.arr[i] = {x:tools.getRandNum(world.x0, world.x1),y: tools.getRandNum(world.y0, world.y1)};
					changeRadius(e,bots.r,false,n);
				}
		}
	});
	io.sockets.emit('balls', balls); 
	io.sockets.emit('bots', bots); 
	setTimeout(handler,gamespeed);
}
var timeStart = new Date();
console.log("Server start at "+timeStart.getFullYear()+"/"+(timeStart.getMonth()+1)+"/"+timeStart.getDate()+" "+ timeStart.getHours()+":"+timeStart.getMinutes()+":"+timeStart.getSeconds());