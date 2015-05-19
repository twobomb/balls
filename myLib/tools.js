function $(id){//Получение элемента по id
	return document.getElementById(id);
}
function toInt(value){//Дороботанный parseInt
	if(typeof(value)=='number')
		return value;
	if(typeof(value)!='string')
		return 0;
	var result = "";
	for(var i = 0; parseInt(value[i]) || value[i]=='0';i++)
	{	
		result += value[i];
	}
	if(result!="")
		return parseInt(result);
	return 0;
}
//РАБОТА  С КУКАМИ
function getCookie(name) {//Возвращает куки
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function deleteCookie(name) {//Удаляет куки
  setCookie(name, "", {
    expires: -1
  })
}
function setCookie(name, value, options) {//Запись куки options = {expires:10000} ОБЪЕКТ!!!
  options = options || {};
  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}
function loadResources(arr,func,type){//функция загрузки внешних ресурсов arr - массив ссылок, func - функция которая вызовется после загрузки всех ресурсов ,type - тип ресурсов img - картинки
	var loadStatus = false;
	switch(type){
		case "img":
			loadStatus = {count: arr.length, loaded: 0, percent: 0};//length - общее количество ресурсов, loaded - сколько загружено ресурсов, percent сколько загружено в процентах
			for(var i = 0; i < arr.length; i++){
				var tmp = new Image();
				tmp.src = arr[i];
				tmp.onload = function(){
					loadStatus.loaded++;
					loadStatus.percent = (loadStatus.loaded * 100)/loadStatus.count;
					if(loadStatus.loaded >= loadStatus.count)
						func();
				}
			}
			break;	
	}
	return loadStatus;
}
function position(obj,align,valign,otno){//Позиционирование элементов align по ширине(left,center,right),valign по высоте(top,center,bottom)  otno - необязательый параметр, относительно какого элемента позиционируем
	if(typeof(obj)!= 'object')
		return false;	
	var x = 0;
	var y = 0;
	var w= toInt(document.body.clientWidth);
	var h= toInt(document.body.clientHeight);
	if(otno){
		x = toInt(otno.offsetLeft);
		y = toInt(otno.offsetTop);
		w = toInt(otno.offsetLeft) + toInt(otno.offsetWidth);
		h = toInt(otno.offsetTop) + toInt(otno.offsetHeight);
	}
	obj.style.position = 'absolute';
	switch(align)
	{
		case "center":  
			obj.style.left = ((w/2)-(toInt(obj.offsetWidth)/2) > x)?(w/2)-(toInt(obj.offsetWidth)/2):x;	
		break;
		case "left":  
			obj.style.left = x;
		break;
		case "right":  
			obj.style.left = (w-toInt(obj.offsetWidth) > x)?w-toInt(obj.offsetWidth):x;	
		break;
		default: break;
	}
	switch(valign)
	{
		case "center":  
			obj.style.top= ((h/2)-(toInt(obj.offsetHeight)/2) > y)?(h/2)-(toInt(obj.offsetHeight)/2):y;					
		break;
		case "top":  
			obj.style.top = y;
		break;
		case "bottom":  
			obj.style.top= (h-toInt(obj.offsetHeight) > y)?h-toInt(obj.offsetHeight):y;	
		break;
		default: break;
	}
	return obj;
}
function cloneObject(obj){//Клонирование объекта
	var result = {};
	for(value in obj){
		if(typeof obj[value] == "object")
			result[value] = cloneObject(obj[value]);
		else
			result[value] = obj[value];
	}
	return result;
}
function deleteChild(obj,param){//(param не является обязательным аргументом) param==1 - УДАЛЕНИЕ ОБЪЕКТА И ВСЕХ ЕГО ДОЧЕРНИХ ЭЛЕМЕНТОВ иначе удаление ТОЛЬКО дочерних элементов но не объекта!
	if(arguments.length==1)
		param = 0;
	for(i = obj.childNodes.length-1; i>=0;i--)
	{
		if(obj.childNodes[i].legnth>0)
			deleteChild(obj.childNodes[i]);//Внимание рекурсия
		obj.removeChild(obj.childNodes[i]);
	}
	if(param==1)
		obj.parentNode.removeChild(obj);
		
}
var toRadian = function (gr) {
    return gr * Math.PI / 180;
};
var toGradus = function (rad) {
    return rad/ Math.PI * 180;
};
Number.prototype.toRadian = function () {
    return this * Math.PI / 180;
};
Number.prototype.toGradus = function () {
    return this / Math.PI * 180;
};
function createMyElement(e,param,display){//Продвинутая функция создания элемента, пример: createMyElement("div","style.width:100, style.height:200,style.backgroundColor:#F00,innerHTML:qwer123",document.body);
	var obj = document.createElement(e);
	var prop = new Array;
	if(param != "")
		prop = param.split(',');
	for(var i = 0; i < prop.length; i++){
		var textAttr = prop[i].split(':')[0].trim();
		var value = prop[i].split(':')[1].trim();
		textAttr = textAttr.split('.');
		var attr = obj;
		for(var j = 0; j< textAttr.length; j++){
			if(j == textAttr.length-1){
				attr[textAttr[j]] = value;
				break;
			}
			attr = attr[textAttr[j].trim()];
		}
	}
	if(display)
		display.appendChild(obj);
	return obj;
}
function getRandNum(min, max, check)//Возвращает рандмоное число от мин до мах, если check==true тогда оно еще и дробное
{
	if(!check)
		return Math.round(Math.random() * (max - min) + min);
	else
		return Math.random() * (max - min) + min;
}
function randColor(){//Возвращает рандомный цвет вида r,g,b
	var r = getRandNum(0,255);
	var g = getRandNum(0,255);
	var b = getRandNum(0,255);
	return r+","+g+","+b;
}
function hsvToRgb(H,S,V){//Из hsv в rgb
     var f , p, q , t, lH;   
     S /=100;
     V /=100;     
      lH = Math.floor(H / 60);      
      f = H/60 - lH;                    
      p = V * (1 - S);                     
       q = V *(1 - S*f);           
       t = V* (1 - (1-f)* S);      
    switch (lH){      
          case 0: R = V; G = t; B = p; break;
          case 1: R = q; G = V; B = p; break;
          case 2: R = p; G = V; B = t; break;
          case 3: R = p; G = q; B = V; break;
          case 4: R = t; G = p; B = V; break;
          case 5: R = V; G = p; B = q; break;
	}
   return [parseInt(R*255), parseInt(G*255), parseInt(B*255)];
}
function generateColor(){//Возвращает рандомный цвет в виде объекта {r:r,g:g,b:b}
		return {r:getRandNum(0,255),g:getRandNum(0,255),b:getRandNum(0,255)};
}
function getAngle(x1,x2,y1,y2,check){//Угол по двум точкам,  // 180<---.--->0 градусов, идет по часовой
	if(check)
		return (Math.atan2(y1 - y2,x1 - x2)/Math.PI * 180);
	return ((Math.atan2(y1 - y2,x1 - x2)/Math.PI * 180)+180)%360;
}

function circleCollision(x1,x2,y1,y2,r1,r2){//Столкновение шаров
	var angle = getAngle(x1,x2,y1,y2).toRadian();
	var t = Math.abs((x1 - x2)*Math.cos(angle)) + Math.abs((y1 - y2)*Math.sin(angle));
	if(r1 + r2 > t)
		return true;//Столкнулись
	else
		return false;//Не столкнулись
}

function postHandler(ctx,x,y,w,h,r,g,b){
	var mydata =ctx.getImageData(x, y, w,h);
	for(i = 0;i< mydata['data'].length;i+= 4){
		r = mydata['data'][i];
		g = mydata['data'][i+1];
		b = mydata['data'][i+2];
		// alpha = mydata['data'][i+3];			
		r *= r;
		g *=  g;
		b *=  b;
		 mydata['data'][i] = r;
		 mydata['data'][i+1] = g;
		 mydata['data'][i+2] = b;
	}	
	ctx.putImageData(mydata,0,0);
}
module.exports.toRadian = toRadian;
module.exports.toGradus = toGradus;
module.exports.getRandNum = getRandNum;
module.exports.randColor = randColor;
