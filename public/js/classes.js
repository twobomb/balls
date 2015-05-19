/* var ball = function(x,y,r,color,id){
	this.x = x || 10;
	this.y = y || 10;
	this.r = r || 20;
	this.color = color || "#F00";
	this.id = id || 0;
	this.speed = 2;
	this.angle = 0;	
} */
var rect = function(x,y,w,h,fillColor,strokeColor){
	this.x = x || 0;
	this.y = y || 0;
	this.h = h || 10;
	this.w = w || 10;
	this.lineWidth = 15;
	this.fill = {color: fillColor|| "#000", enable: true};
	this.stroke = {color: strokeColor || "#FFF", enable: false};
	this.draw = function(ctx){
		if(this.stroke.enable){
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.stroke.color;
			ctx.strokeRect(this.x,this.y,this.w,this.h);
			ctx.lineWidth = 1;
		}	
		if(this.fill.enable){
			ctx.fillStyle = this.fill.color;
			ctx.fillRect(this.x,this.y,this.w,this.h);
		}	
	}
	new mouseEvent(this);//возможно будет грузить 
}
function createKeyboard(canva,x,y,w,h,callback,margL,margT,sameWidthEnable){//callback(id,name,btn)
	var _this = this;
	this.onShift = false;
	var marginLeft = margL || 5;
	this.canva = canva;
	var marginTop = margT || 5;
	var rows = new Array;
	rows = [
	[[1,'!'],[2,"@"],[3,"#"],[4,"$"],[5,"%"],[6,"^"],[7,"&"],[8,"*"],[9,"("],["0",")"],["-","_"],["=","+"]],
	[["q","Q"],["w","W"],["e","E"],["r","R"],["t","T"],["y","Y"],["u","U"],["i","I"],["o","O"],["p","P"],["[","{"],["]","}"]],
	[["a","A"],["s","S"],["d","D"],["f","F"],["g","G"],["h","H"],["j","J"],["l","L"],[";",":"]],
	[["Shift","SHIFT"],["z","Z"],["x","X"],["c","C"],["v","V"],["b","B"],["n","N"],["m","M"],[",","<"],[".",">"]],
	[["<-Backspace","<-Backspace"],["Space","Space"],["Enter","Enter"]]
	];
	var sameWidth = {enable: sameWidthEnable || true, minWidth: rows[0].length};
	this.bg = new rect(x,y,w,h,"#000");
	this.bg.stroke.enable = true;
	this.bg.stroke.color = "#444";
	this.keys = new Array;
	if(sameWidth.enable)
		for(var i = 0; i < rows.length; i++)
			if(rows[i].length > sameWidth.minWidth )
				sameWidth.minWidth = rows[i].length;
		
	for(var i = 0,btnId = 0; i < rows.length; i++){
		if(sameWidth.enable && /*Последний ряд позиционируется по своей ширине ->*/ i != rows.length-1 )
			var wKey =  (w-(marginLeft * sameWidth.minWidth) - marginLeft)/sameWidth.minWidth;
		else
			var wKey =  (w-(marginLeft * rows[i].length) - marginLeft)/rows[i].length;
		
		var hKey = (h-(marginTop * rows.length)- marginTop)/rows.length;
		for(var j = 0; j < rows[i].length; j++, btnId++){
			//key
			var xKey = x + marginLeft + (j*wKey) + (j * marginLeft);
			var yKey = y + marginTop+(i*hKey) + (i * marginTop);
			var key = new rect(xKey,yKey,wKey,hKey,"#FFF");
			key.fill.color = "#000";
			key.stroke.color = "#FFF";
			key.stroke.enable = true;
			key.lineWidth = 4;
			//text
			var keycaption = new text(xKey,yKey+hKey/3,rows[i][j][0],(hKey/3)+"px","#FFF",true,0,false,"Consolas","Normal");
			keycaption.keyText = {normal: rows[i][j][0], shift: rows[i][j][1]};
			keycaption.position = {
				x: xKey,
				w: wKey,
				y: yKey ,
				h: hKey,
				enable: true
			};
			key.id = btnId;
			key.caption = keycaption;
			this.keys.push(key);
		}
	}
	this.draw = function(ctx){
		_this.bg.draw(ctx);
		_this.keys.forEach(function(e){
			e.draw(ctx);
			e.caption.draw(ctx);
		});
	}
	this.destroy = function(){
		 // alert("DESTROY");
		_this.canva.removeEventListener("click",_this.onclickButton);
		window.removeEventListener("keydown",_this.onkeydown);
		delete _this;
	}
	this.onkeydown = function(e){
		if(e.keyCode == 8)
			e.preventDefault();
		callback(e.keyCode);		
	}
	this.onclickButton = function(eventVar){
		x = eventVar.clientX - canvas.offsetLeft;
		y = eventVar.clientY - canvas.offsetTop;
		for(var z =0; z < _this.keys.length; z++){
			e = _this.keys[z];
			if(x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h){
				var realCode = 0;
				if(e.id == 43)
					realCode = 8;
				else if(e.id == 44)
					realCode = 32;
				else if(e.id == 45)
					realCode = 13;
				else if(e.id == 33)
					realCode = 16;
				else
					realCode = (e.caption.text.toString()).charCodeAt();
				callback(realCode,e.caption.text,e);
				break;
			}
		}
	};
	this.canva.addEventListener("click",this.onclickButton);
	window.addEventListener("keydown",this.onkeydown);
}

function colorPicker(canvas,x,y,H,w,h,cx,cy){//H - Hue, cx - Saturation, cy - Value(Brightnes) w,h размер одного цвета в идеале ставить 1,1
	this.x = x;
	this.y = y;
	this.cx = cx || w * 100;
	this.cy = cy || 0;
	this.w = w || 1;
	this.h = h || 1;
	this.H = Math.abs(H % 360);//hue 0 - 360 , 360й дублирует 0й
	this.checkClick = false;
	this.clickBy = false;
	if(this.cx > this.w * 100 || this.cx < 0)
		this.cx = this.w * 100;
	if(this.cy > this.h * 100 || this.cy < 0)
		cy = 0;
	this.hueGrad = {x: this.x + (this.w * 100)+(this.w * 10)+5,y:this.y, w: this.w * 10, h: this.h * 100};
	this.picker ={x: this.x, y: this.y,w: this.w,h: this.h};
	var _this = this;
	this.mousedown = function(e){
			var x = e.clientX - canvas.offsetLeft;
			var y = e.clientY - canvas.offsetTop;
			if(x >= _this.picker.x && x <= _this.picker.x + (_this.picker.w * 100) &&
				y >= _this.picker.y && y <= _this.picker.y + (_this.picker.h * 100)){
					_this.checkClick = true;
					_this.clickBy = "picker";
					_this.mousemove(e);
				}
			else if(x >= _this.hueGrad.x && x <= _this.hueGrad.x + _this.hueGrad.w &&
					y >= _this.hueGrad.y && y <= _this.hueGrad.y + _this.hueGrad.h ){
						_this.checkClick = true;
						_this.clickBy = "hueGrad";
						_this.mousemove(e);
			}
	};
	this.mousemove = function(e){
		if(_this.checkClick){
			var x = e.clientX - canvas.offsetLeft;
			var y = e.clientY - canvas.offsetTop;
			switch(_this.clickBy){
				case "picker":
					if(x < _this.picker.x)
						x = 0;
					else if(x > _this.picker.x + (_this.picker.w * 100))
						x = _this.picker.w * 100;
					else
						x = x - _this.picker.x;
					
					if(y < _this.picker.y)
						y = 0;
					else if(y > _this.picker.y + (_this.picker.h * 100))
						y = _this.picker.h * 100;
					else
						y = y - _this.picker.y;
					
					_this.cx = x;
					_this.cy = y;

					break;
				case "hueGrad":
					if(y < _this.hueGrad.y)
						y = 0;
					else if(y > _this.hueGrad.y + _this.hueGrad.h)
						y = _this.hueGrad.h;
					else
						y = y - _this.hueGrad.y;
					_this.H = 360-((y)/_this.hueGrad.h * 360);
					break;
				}
			}
			_this.rgb = toRGB(_this.H%360,_this.cx/_this.w,100 - (_this.cy/_this.h));
	}
	this.mouseup= function(){
		_this.checkClick = false;
	}
	canvas.addEventListener("mousedown",this.mousedown);
	window.addEventListener("mouseup",this.mouseup);
	canvas.addEventListener("mousemove",this.mousemove);
	this.destroy = function(canvas){
		canvas.removeEventListener("mousedown",_this.mousedown);
		window.removeEventListener("mouseup",_this.mouseup);
		canvas.removeEventListener("mousemove",_this.mousemove);
	}
	this.draw = function(ctx){
		for(var S = 0,x = this.picker.x; S < 100; S++,x+=this.picker.w){
			for(var V = 0,y = this.picker.y; V < 100; V++,y+=this.picker.h){
					ctx.fillStyle = toRGB(this.H%360,S,99 - V);
					ctx.fillRect(x,y,this.picker.w,this.picker.h);
			}
			this.picker.y = this.y;
		}	
		ctx.beginPath();
		this.circle = {r: 2 * (this.w+this.h)/2,x: this.x + this.cx, y: this.y + this.cy};
		ctx.arc(this.circle.x,this.circle.y,this.circle.r,0,Math.PI * 2);
		ctx.lineWidth = 1 * (this.w+this.h)/2;	
		ctx.strokeStyle =  colorManipulate(this.rgb,"invert");
		ctx.stroke();
		ctx.closePath();
		this.delta = {h:5 * this.h,
					w: 5 * this.w};
		this.delta.x =  this.hueGrad.x + this.hueGrad.w + this.delta.w; 
		this.delta.y = (this.hueGrad.y - this.delta.h/2)+ ((360 - this.H) * this.hueGrad.h)/360;
		ctx.beginPath();
		ctx.moveTo(this.delta.x,this.delta.y);
		ctx.lineTo(this.delta.x,this.delta.y+this.delta.h);
		ctx.lineTo(this.delta.x-this.delta.w,this.delta.y+this.delta.h/2);
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.closePath();
		this.delta.x -= this.hueGrad.w+this.delta.w;
		ctx.beginPath();
		ctx.moveTo(this.delta.x - this.delta.w,this.delta.y);
		ctx.lineTo(this.delta.x - this.delta.w,this.delta.y+this.delta.h);
		ctx.lineTo(this.delta.x,this.delta.y+this.delta.h/2);
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.closePath();
		
		var hue = [[255,0,0],[255,255,0],[0,255,0],[0,255,255],[0,0,255],[255,0,255],[255,0,0]];
		var grd = ctx.createLinearGradient(this.hueGrad.x + this.hueGrad.w/2 , this.hueGrad.y + this.hueGrad.h,this.hueGrad.x + this.hueGrad.w/2 , this.hueGrad.y );               
		 for (var i=0; i < hue.length;i++){
			 var color = 'rgb('+hue[i][0]+','+hue[i][1]+','+hue[i][2]+')';
			grd.addColorStop(i * 1/(hue.length - 1),color);
		}
		ctx.fillStyle = grd;
		ctx.fillRect(this.hueGrad.x,this.hueGrad.y,this.hueGrad.w,this.hueGrad.h);
		
		this.colorRect = {w: 30 * this.w, h: 30 * this.h};
		this.colorRect.x = this.x -this.colorRect.w - (this.w+this.h)/2*10;
		this.colorRect.y = this.y + (this.h*100)/2 - this.colorRect.h/2;
		ctx.fillStyle = this.rgb;
		ctx.fillRect(this.colorRect.x,this.colorRect.y,this.colorRect.w,this.colorRect.h);
		ctx.strokeStyle = "#FFF";
		ctx.lineWidth = 5;
		ctx.strokeRect(this.colorRect.x,this.colorRect.y,this.colorRect.w,this.colorRect.h);
		ctx.font = "Normal "+(this.w+this.h)/2*10+"px Impact";
		ctx.fillStyle = "#FFF";
		ctx.fillText("#"+colorManipulate(this.rgb),this.colorRect.x,this.colorRect.y - 10);	
	}
	this.rgb = toRGB(this.H%360,parseInt((this.cx * 100)/(100 * this.w)),parseInt(100 - ((this.cy * 100)/(100 * this.h))));
}
function text(x,y,text,size,fillColor,fillEnable,strokeColor,strokeEnable,fontFamily,typeFont,lineWidth){	
	this.x = x || 0;
	this.y = y || 0;
	this.size = size || "50px"
	this.fill = {color: fillColor, enable: fillEnable};
	this.stroke = {color: strokeColor, enable: strokeEnable};
	this.typeFont = typeFont || "italic";
	this.fontFamily = fontFamily || "Arial";
	this.text = text || "example";
	this.lineWidth = lineWidth || 10;
	this.position = {
		x: 0,
		w: 100,
		y: 0 ,
		h: 100,
		enable: false
	};
	this.draw = function(ctx){
		ctx.font = this.typeFont+" "+this.size+" "+this.fontFamily;
		var x = this.x;
		var y = this.y;
		if(this.position.enable){
			x  = this.position.x + ((this.position.w/2)-(ctx.measureText(this.text).width/2));
			if(toInt(size) && (this.position.y != 0 && this.position.h != 0))
				y = this.position.y + ((this.position.h/2)-((toInt(this.size))/2))+toInt(this.size)/2;
		}
		if(this.stroke.enable){
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.stroke.color;
			ctx.strokeText(this.text, x,y);
			ctx.lineWidth = 1;
		}	
		if(this.fill.enable){
			ctx.fillStyle = this.fill.color;
			ctx.fillText(this.text, x,y);
		}
	}
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
						func(e,element);					
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
							func(e,element);
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
						func(e,element);
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
							func(e,element);
						}
				}
				var tmp = {type: eventType,callback: func, realType:"mousemove",realCallback: newfunc};
				element.events.push(tmp);
				canvas.addEventListener("mousemove",newfunc);
				break;		
		}
	}
}