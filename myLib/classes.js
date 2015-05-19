var ball = function(x,y,r,color,id){
	this.x = x || 10;
	this.y = y || 10;
	this.r = r || 20;
	this.color = color || "#F00";
	this.id = id || 0;
	this.speed = 120;
	this.angle = 0;	
}
var rect = function(x,y,w,h,url, countx,county){
	this.x = x || 0;
	this.y = y || 0;
	this.h = h || 10;
	this.w = w || 10;
	this.angle = 0;	
	this.sprite = new sprite(url, countx,county);
	this.draw = function(ctx){
		 this.sprite.draw(ctx, this.x, this.y, this.w, this.h, 0, 0,{angle:this.angle , offsetX:"center",offsetY:"center"});
	};	
	new mouseEvent(this);
}
function sprite(url, countx,county){
	var obj = this;
	obj.img = new Image();
	obj.img.src = url || "images/sprites/texture_error.png";
	obj.wSprite = obj.img.width/obj.countX || "";
	obj.hSprite = obj.img.height/obj.countY || "";
	obj.frameX = 1;
	obj.frameY = 1;
	obj.speed = 80;//—скорость смены спрайтов в мс
	obj.lastTime = Date.now();
	obj.countX = countx || 1;
	obj.countY = county || 1;
	obj.status = 's';//s - stop; p - play; r - reverse play; pp - play pattern rp - reverse pattern
	obj.pattern = [1,1,1,1];//Ўаблон ограничени€ анимации пример [x1,y1,x2,y2] от кадра x1;y1 до y2;y2
	obj.draw = function(ctx, x, y, w, h, offsetX, offsetY,angle){//angle = {angle:360, offsetX: 10 || "left", offsetY: 23 || botton}
		if(!offsetX)
			offsetX = 0;
		if(!offsetY)
			offsetY = 0;
		obj.img.onload = function(){
			obj.wSprite = this.width/obj.countX;
			obj.hSprite = this.height/obj.countY;
		}
		if(!obj.wSprite || !obj.hSprite){
			obj.wSprite = obj.img.width/obj.countX;
			obj.hSprite = obj.img.height/obj.countY;
		}
		if(typeof angle == "object"){
			if(typeof angle.offsetX != "number")
				switch(angle.offsetX){
					case "left": angle.offsetX = 0;break;
					case "center": angle.offsetX = w/2;break;
					case "right": angle.offsetX = w;break;
					default: angle.offsetX = 0;
				}
			if(typeof angle.offsetY != "number")
				switch(angle.offsetY){
					case "top": angle.offsetY = 0;break;
					case "center": angle.offsetY = h/2;break;
					case "bottom": angle.offsetY = h;break;
					default: angle.offsetY = 0;
				}
			ctx.save();
			ctx.translate((x + angle.offsetX + offsetX), (y  + angle.offsetY + offsetY ));
			ctx.rotate(angle.angle.toRadian());
			ctx.translate(-(x + angle.offsetX + offsetX), -(y + angle.offsetY + offsetY));
			ctx.drawImage(obj.img, (obj.frameX - 1)*obj.wSprite, (obj.frameY - 1)*obj.hSprite, obj.wSprite, obj.hSprite, x+offsetX, y +offsetY, w, h);
			ctx.restore();
		}
		else
			ctx.drawImage(obj.img, (obj.frameX - 1)*obj.wSprite, (obj.frameY - 1)*obj.hSprite, obj.wSprite, obj.hSprite, x+offsetX, y +offsetY, w, h);
		obj.nextStep();
	}
	obj.setPattern = function(temp){
		obj.pattern = temp;
		obj.frameX = obj.pattern[0];
		obj.frameY = obj.pattern[1];
	}
	obj.nextStep = function(){
		if(Date.now() - obj.lastTime < obj.speed)
			return false;
		obj.lastTime = Date.now();
		switch(obj.status){		
			case 'pp':
				if(obj.frameX == obj.pattern[2] && obj.frameY == obj.pattern[3])
				{
					obj.frameX = obj.pattern[0];
					obj.frameY = obj.pattern[1];
					break;
				}
			case 'p':
				if(obj.frameX+1 <= obj.countX)
					obj.frameX++;
				else{
					obj.frameX = 1;
					if(obj.frameY+1 <= obj.countY)
						obj.frameY++;
					else
						obj.frameY = 1;
				}
				break;			
			
			case 'rp':
				if(obj.frameX == obj.pattern[2] && obj.frameY == obj.pattern[3])
				{
					obj.frameX = obj.pattern[0];
					obj.frameY = obj.pattern[1];
					break;
				}
			case 'r':
				if(obj.frameX-1 > 0)
					obj.frameX--;
				else{
					obj.frameX = obj.countX;
					if(obj.frameY-1 > 0)
						obj.frameY--;
					else
						obj.frameY = obj.countY;
				}
				break;
			default: return false;
		}
		return true;
	}
	obj.setFrame = function(frameX, frameY){		
		frameX = parseInt(frameX);
		frameY = parseInt(frameY);
		if(typeof frameX !== 'number' || frameX< 0 || frameX> obj.countX)
			return false;
		obj.frameX = frameX;
		if(typeof frameY !== 'number' || frameY< 0 || frameY> obj.countY)
			return false;
		obj.frameY = frameY;
			return true;
	}
}
function mouseEvent(element){
	element.events = new Array;
	element.deleteEvents = function(canvas){
		element.events.forEach(function(e){
				canvas.removeEventListener(e.realType,e.realCallback);					
		});
	};
	element.setEvent = function(canvas,eventType,func){
		switch(eventType){
			case "mousedown":case "mouseup":case "click": 
				var newfunc = function(e){
					var x = e.clientX - canvas.offsetLeft;
					var y = e.clientY - canvas.offsetTop;
					if(x >= element.x && x <= element.x + element.w &&
						y >= element.y && y <= element.y + element.h){
						e.canvasX = e.clientX - canvas.offsetLeft;
						e.canvasY = e.clientY - canvas.offsetTop;
						e.elementX = x - element.x;
						e.elementY = y - element.y;
						func(e);					
					}
				};
				element.events.push({type: eventType,callback: func, realType:eventType,realCallback: newfunc});
				canvas.addEventListener(eventType,newfunc);
				break;	
			case "mouseover":
				var newfunc = function(e){
					var x = e.clientX - canvas.offsetLeft;
					var y = e.clientY - canvas.offsetTop;
					if(x >= element.x && x <= element.x + element.w &&
						y >= element.y && y <= element.y + element.h){
						if(!tmp.used){
							tmp.used = true;
							e.canvasX = e.clientX - canvas.offsetLeft;
							e.canvasY = e.clientY - canvas.offsetTop;
							e.elementX = x - element.x;
							e.elementY = y - element.y;
							func(e);
						}
					}
					else if(tmp.used)
						tmp.used = false;
				};
				var tmp = {type: eventType,callback: func, used: false, realType:"mousemove",realCallback: newfunc};
				element.events.push(tmp);
				canvas.addEventListener("mousemove",newfunc);
				break;	
			case "mouseout":
				var newfunc = function(e){
					var x = e.clientX - canvas.offsetLeft;
					var y = e.clientY - canvas.offsetTop;
					if(x >= element.x && x <= element.x + element.w &&
						y >= element.y && y <= element.y + element.h){
						if(tmp.used){
							tmp.used = false;
						}
					}
					else if(!tmp.used){						
						tmp.used = true;							
						e.canvasX = e.clientX - canvas.offsetLeft;
						e.canvasY = e.clientY - canvas.offsetTop;
						e.elementX = x - element.x;
						e.elementY = y - element.y;
						func(e);
					}
				}
				var tmp = {type: eventType,callback: func, used: false,realType:"mousemove",realCallback: newfunc};
				element.events.push(tmp);
				canvas.addEventListener("mousemove",newfunc);
				break;
			case "mousemove":
				var newfunc = function(e){
					var x = e.clientX - canvas.offsetLeft;
					var y = e.clientY - canvas.offsetTop;
					if(x >= element.x && x <= element.x + element.w &&
						y >= element.y && y <= element.y + element.h){							
							e.canvasX = e.clientX - canvas.offsetLeft;
							e.canvasY = e.clientY - canvas.offsetTop;
							e.elementX = x - element.x;
							e.elementY = y - element.y;
							func(e);
						}
				}
				var tmp = {type: eventType,callback: func, realType:"mousemove",realCallback: newfunc};
				element.events.push(tmp);
				canvas.addEventListener("mousemove",newfunc);
				break;		
		}
	}
}
module.exports.ball = ball;
module.exports.rect = rect;