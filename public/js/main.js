var ctxW = 500, ctxH = 750,canvas,id = 0,fps = 30,offsetX = 0,offsetY = 0,status = "spectator",lastUpdate = 0,username = "player",linesColor = "#EEE"/* Цвет линий */;
gamespeed = 1000/fps;
var mouseCord = {
	x:0,
	y:0,
	lx:0,
	ly:0,
	timeRequest: 100,
	lastRequest: 0
};
var myBall,world = {x0: 0 , y0: 0, x1: 0 , y1: 0},balls = new Array,newBalls = new Array,bots = {arr:new Array},botsColors = new Array;
var drawBuffer = new Array,smoothFrames  ={handler:function(){}};
function addDrawBuffer(name,func,destruct){
	drawBuffer.push({name: name, drawFunction: func,destruct:destruct});
}
function removeDrawBuffer(name){
	for(var i = 0; i < drawBuffer.length; i++){
		if(name == drawBuffer[i].name){
			if(typeof drawBuffer[i].destruct == "function")
				drawBuffer[i].destruct(drawBuffer[i]);
			delete drawBuffer[i];
			drawBuffer.splice(i,1);
			break;
		}
	}
}
function checkDrawBuffer(name){
	for(var i = 0; i < drawBuffer.length; i++)
		if(name == drawBuffer[i].name)
			return true;
	return false;
}
window.onload = function(){
		// window.socket = io.connect("localhost:8080");
		window.socket = io.connect(window.location.href);
		// window.socket = io.connect("http://balls-46476.onmodulus.net:8080");
		ctxH = document.body.offsetHeight;
		ctxW = document.body.offsetWidth;
		canvas = position(createMyElement("canvas","id: canvas,width:"+ctxW+",height:"+ctxH,document.body),"center","center");
		// canvas.style.cursor = "url(images/cursor.cur), pointer";
		window.ctx = canvas.getContext('2d');
	socket.on('bots',function(data){
		bots = data;
	});
	socket.on('misc',function(data){
		id = data.id;
		world = data.world;
		for(var i = 0;i < data.botsLimit; i++)
			botsColors.push("rgb("+randColor()+")");
		smoothFrames = { enable:true,value:(fps >= data.serverFps)?fps/data.serverFps:1,nowStep:Math.ceil(((fps >= data.serverFps)?fps/data.serverFps:1)),maxStep:Math.ceil(((fps >= data.serverFps)?fps/data.serverFps:1)),handler:function(){
			if(!smoothFrames.enable)
				return false;
			if(smoothFrames.nowStep < smoothFrames.maxStep){
				for(var i = 0; i < balls.length; i++){
					balls[i].x += newBalls[i].pX;
					balls[i].y += newBalls[i].pY;	
					balls[i].r += newBalls[i].pR;	
				}
				smoothFrames.nowStep++;
			}
			else
				balls = newBalls;		
		}};
	});
	socket.on('youDie',function(data){
		if(data.id == id)
			status = "diespectator";
	});
	socket.on('balls',function(data){
		if(smoothFrames.enable){
			lastUpdate = Date.now();
			newBalls = data;
			if(newBalls.length == balls.length)
				for(var i = 0; i < newBalls.length; i++){
					if(newBalls[i].id != balls[i].id){
						balls = newBalls;
						break;
					}
					newBalls[i].pX = (newBalls[i].x - balls[i].x)/smoothFrames.value;
					newBalls[i].pY = (newBalls[i].y - balls[i].y)/smoothFrames.value;
					newBalls[i].pR = (newBalls[i].r - balls[i].r)/smoothFrames.value;
					if(i >= newBalls.length - 1)
						smoothFrames.nowStep = 1;
				}
			else
				balls = data;			
		}
		else
			balls = data;
		switch(status){
			case "game":
				for(var i = 0; i < data.length; i++){
					if(data[i].id == id){
						myBall = i;
						break;
					}					
				}
			break;
			case "spectator":
				myBall = (balls.length > 0 )?0:undefined;			
				break;
		}
		offsetX = worldOffsetX(balls[myBall]);
		offsetY = worldOffsetY(balls[myBall]);
	});	
	canvas.addEventListener("mousemove",function(e){
			mouseCord.x = e.clientX - canvas.offsetLeft - offsetX;
			mouseCord.y = e.clientY - canvas.offsetTop - offsetY;
			sendCord();
	});
	window.addEventListener("resize",function(e){
		if(ctxH != document.body.offsetHeight){
			ctxH = document.body.offsetHeight;
			canvas.height = ctxH;
		}
		if(ctxW != document.body.offsetWidth){
			ctxW = document.body.offsetWidth;
			canvas.width = ctxW;
		}
		if(checkDrawBuffer("menu")){
				removeDrawBuffer("menu");
				createMenu();
		}
		if(checkDrawBuffer("keyboard"))
				removeDrawBuffer("keyboard");
	});
	createMenu();
	handler();
}
function draw(){
	ctx.clearRect(0,0,ctxW,ctxH);	
	ctx.beginPath();
	ctx.strokeStyle = linesColor;
	ctx.lineWidth = 1;
	for(var i = world.y0; i <= world.y1; i+= 25){
		ctx.moveTo(world.x0+offsetX,i+offsetY);
		ctx.lineTo(world.x1+offsetX,i+offsetY);
		ctx.stroke();
	}
	for(var i = world.x0; i <= world.x1; i+= 25){
		ctx.moveTo(i+offsetX,world.y0+offsetY);
		ctx.lineTo(i+offsetX,world.y1+offsetY);
		ctx.stroke();
	}
	ctx.closePath();
	bots.arr.forEach(function(d,i){
		ctx.beginPath();
		ctx.fillStyle = botsColors[i] || "#F00";
		ctx.arc(d.x+offsetX,d.y+offsetY,bots.r,0,Math.PI*2);		
		ctx.fill();
		ctx.closePath();
	});
	balls.forEach(function(d){
		ctx.beginPath();
		ctx.fillStyle = d.color;
		var color = colorManipulate(d.color,"object");
		ctx.strokeStyle = "rgb("+(color.r - 50)+","+(color.g - 50)+","+(color.b-50)+")";
		ctx.arc(d.x+offsetX,d.y+offsetY,d.r,0,Math.PI*2);
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.stroke();	
		ctx.fillStyle = colorManipulate(d.color,"invert");
		// ctx.strokeStyle = "#000";
		ctx.font = "Bold "+ d.r/2 +"px Arial";	
		txt = d.username;
		ctx.lineWidth = 1;
		ctx.fillText(txt, d.x+offsetX - ctx.measureText(txt).width/2 , d.y +offsetY );
		// if(d.r > 50)
		// ctx.strokeText(txt, d.x+offsetX -  ctx.measureText(txt).width/2 , d.y +offsetY);	
		ctx.closePath();	
	});	
	drawBuffer.forEach(function(e){
		e.drawFunction(ctx);
	});
	
	switch(status){
		case "diespectator":
			ctx.fillStyle = "#FFF";
			ctx.strokeStyle = "#000";
			ctx.font = "Normal 100px Impact";
			ctx.lineWidth = 5;
			var txt = "Потрачено";
			ctx.fillText(txt, ctxW/2 - ctx.measureText(txt).width/2 , ctxH/2 - 50  );
			ctx.strokeText(txt, ctxW/2 - ctx.measureText(txt).width/2 , ctxH/2 - 50  );
			if(balls.length >0)
				myBall = 0;
		break;
	}
	
}
function handler(){
	// smoothFrames.enable = false;
	smoothFrames.handler();
	offsetX = worldOffsetX(balls[myBall]);
	offsetY = worldOffsetY(balls[myBall]);
	draw();
	setTimeout(handler,gamespeed);
}
function createMyKeyboard(canvas,x,y,w,h){
	var keyBoard = new createKeyboard(canvas,x,y,w,h,function(keycode,name,el){
		switch(keycode){
			case 8://backspace
				username = username.substr(0, username.length - 1);
				break
			case 16://shift
				keyBoard.onShift = !keyBoard.onShift;
				for(var i = 0,txt = ((keyBoard.onShift)?"shift":"normal"); i < keyBoard.keys.length; i++){
					keyBoard.keys[i].caption.text = keyBoard.keys[i].caption.keyText[txt];
				if(keyBoard.keys[i].id == 33)
					if(keyBoard.onShift)
						keyBoard.keys[i].fill.color = "#700";
					else
						keyBoard.keys[i].fill.color = "#000";
				}
				break
			case 13://enter
				username = username.trim();
				if(username.length <= 0)
					username = "noname";
				removeDrawBuffer("keyboard");
				break;
			default:
				if(username.length < 20)
					username += (keyBoard.onShift)?String.fromCharCode(keycode).toUpperCase():String.fromCharCode(keycode).toLowerCase();
				break;
		}
	});
	addDrawBuffer("keyboard",keyBoard.draw,keyBoard.destroy);
}
function createMenu(){
	var menu = {};
	var w = 400, h = 580;
	menu.bg = new rect((ctxW/2) - (w/2),(ctxH >= h)?(ctxH/2)-(h/2):0,w,h,"rgba(0,0,0,0.5)");
	menu.caption = new text(menu.bg.x+80,menu.bg.y+70,"Balls game","50px","#000",true,"#FFF",true,"Impact","Normal",10);
	menu.nik = new text(menu.bg.x+10,menu.bg.y+140,"Введите ваш ник","50px","#FFF",true,"#000",true,"Impact","Normal",10);
	menu.nikField = new rect(menu.bg.x+10,menu.bg.y+180,w-20,40,"#000","#FFF");
	menu.nikField.stroke.enable = true;
	menu.nikField.lineWidth = 4;
	menu.nikField.setEvent(canvas,"click",function(){if(!checkDrawBuffer("keyboard"))createMyKeyboard(canvas,menu.nikField.x - 100,menu.nikField.y + menu.nikField.h+20,600,300);});
	menu.username = new text(menu.bg.x+10,menu.bg.y+210,username,"30px","#FFF",true,"#000",false,"Impact","Normal");
	menu.username.position = {
		x: menu.nikField.x,
		w: menu.nikField.w,
		y: 0 ,
		h: 0,
		enable: true
	};
	menu.color = new text(menu.bg.x+30,menu.bg.y+280,"Выберите цвет","50px","#FFF",true,"#000",true,"Impact","Normal",10);
	menu.colorPic = new colorPicker(canvas,parseInt(menu.bg.x +100),parseInt(menu.bg.y + 300),0,2,2);
	menu.confBtn = new rect(menu.bg.x + (w/2)/2,menu.bg.y + 520,w/2,40,"#000","#FFF");
	menu.confBtn.stroke.enable = true;
	menu.confBtn.lineWidth = 10;
	menu.confBtn.setEvent(canvas,"click",function(){
			// console.log(username,menu.colorPic.rgb);
			socket.emit("ready",{username: username , color: menu.colorPic.rgb});
			removeDrawBuffer("menu");
			status = "game";
	});
	menu.btnText = new text(menu.bg.x + (w/2)/2,menu.bg.y + 550,"Начать","30px","#FFF",true,"#000",false,"Impact","Normal",10);
	menu.btnText.position = {
		x: menu.confBtn.x,
		w: menu.confBtn.w,
		y:  0,
		h:  0,
		enable: true
	};
	menu.draw = function(ctx){
		menu.bg.draw(ctx);
		menu.caption.draw(ctx);
		menu.nik.draw(ctx);
		menu.nikField.draw(ctx);
		menu.username.text = username;
		menu.username.draw(ctx);
		menu.color.draw(ctx);
		menu.colorPic.draw(ctx);
		menu.confBtn.draw(ctx);
		menu.btnText.draw(ctx);
	}
	addDrawBuffer("menu",menu.draw,function(){
		menu.nikField.deleteEvents(canvas);
		menu.confBtn.deleteEvents(canvas);
		menu.colorPic.destroy(canvas);
	});
	return menu;
}
function worldOffsetX(obj){
	if(typeof obj == "object"){
		if(obj.x - ctxW/2 < 0)
			return world.x0;
		else {
			if(obj.x + ctxW/2 > world.x1)
				return -(world.x1- ctxW);
			else
				return -(obj.x - ctxW/2);
		} 
	}
	return 0;
}
function worldOffsetY(obj){
	if(typeof obj == "object"){
			if(obj.y - ctxH/2 < 0)
			return world.y0;
		else {
			if(obj.y + ctxH/2 > world.y1)
				return -(world.y1- ctxH);
			else
				return -(obj.y - ctxH/2);
			} 
	}
	return 0;
}
function sendCord(){
		if(Date.now() - mouseCord.lastRequest >= mouseCord.timeRequest){
			mouseCord.lastRequest = Date.now();
			if(balls[myBall] && (mouseCord.x != mouseCord.lx || mouseCord.y != mouseCord.ly)){
				balls[myBall].angle = getAngle(mouseCord.x,balls[myBall].x,mouseCord.y,balls[myBall].y,true);
				socket.emit("angle",balls[myBall].angle);
				mouseCord.ly = mouseCord.y;
				mouseCord.lx = mouseCord.x;
			}
		}
		else
			setTimeout(sendCord,mouseCord.timeRequest);
}

