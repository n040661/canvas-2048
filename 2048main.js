/**
 *程序流程
 *----------
 *||
 *||--绑定事件--||--键盘方向事件
 *||           ||--图标事件：重启、信息、测试胜利和失败
 *||
 *||--胜利条件判断--||--winFlag--全局、随程序修改
 *||			  
 *||初始化--||--生成circlePoolArray        	 
 *||       ||--绘制openningAnimation
 *||	   ||--生成初始的两个数
 *||	   ||--生成currentNumberArray
 *||
 *||键盘方向事件--||--判断方向
 *||	        ||--判断游戏胜利还是失败
 *||	        ||--如果winFlag=1,转置数组
 *||	        ||--清空数组中的0
 *||	        ||--每一行合并相邻且相同的项，并且合并之后的项不会再合并
 *||	        ||--给数组的每一行unshift若干个0至长度为四
 *||	        ||--通过转置还原数组，获得按下键盘方向键之后应该的数组nextNumberArray
 *||	        ||--比对nextNumberArray和currentNumberArray，获取整个十六宫格有变动的区域positon数组
 *||	        ||--通过position,获取该区域内数字转换成像素点的数组：需要移动的圆的数组，以及目标位置圆数组
 *||	        ||--将这两个数组传入动画函数，进行动画绘制
 *||	        ||--动画完毕之后，刷新数据。
 *||
 *||测试胜利失败、信息动画--||在数组动画执行的时候禁用
 */ 


/**
 * 前一帧数字数组
 * @type {Array}
 */ 
var currentNumberArray = [];
/**
 * 数字数组
 * @type {Array}
 */
var nextNumberArray = [];
/**
 * 输入的键值
 * @type {Number}
 */
var derection = 0;
/**
 * 文字和数字的圆半径
 * @type {Number}
 */
var R = 5;
/**
 * 在动画进行的时候禁用keydown；0:禁用；1:允许使用；
 * @type {Number}
 */
var keydownFlag = 0;
/**
 * circlePoolArray[i][0]为x坐标; [i][1]为y坐标; [i][2]为半径; [i][3]为alpha
 * @type {Array}
 */
var circlePoolArray = [];	//当前圆点池
var circleArray = [];	//当前文字和数字
var nextCircleArray = [];	//下一步文字和数字
var singleNumberArray = []; //新添加的圆，临时存储用

/**
 * 在指定区域绘制文本
 * @param {string} id 画布的id
 * @param {string} string 需要显示的文字或数字		
 * @param {number} x 字符串中心坐标
 * @param {number} y 字符串底部坐标
 * @param {number} fontSize 文字的大小
 */
function drawText(id,string, x, y,fontSize){
	var message = document.getElementById(id);
	var cellWidth = document.getElementById("board").width / 4;
	if(message.getContext){
		var messageContext = message.getContext("2d");
		messageContext.fillStyle = "white";
		messageContext.globalAlpha = "0.01";
		messageContext.font = "bold " + fontSize + "px Helvetica";	
		messageContext.textAlign = "center";
		messageContext.fillText(string,x,y,cellWidth - 20);
	}
}
/**
 * 绘制开场动画文本
 * @param {string} id 画布的id
 * @param {string} string 需要显示的文字或数字		
 * @param {number} x 字符串中心坐标
 * @param {number} y 字符串底部坐标
 * @param {number} fontSize 文字的大小
 */
function drawOpenningText(id,string, x, y,fontSize){
	var message = document.getElementById(id);
	var cellWidth = document.getElementById("board").width / 4;
	if(message.getContext){
		var messageContext = message.getContext("2d");
		messageContext.fillStyle = "white";
		messageContext.globalAlpha = "0.01";
		messageContext.font = "bold " + fontSize + "px Helvetica";	
		messageContext.textAlign = "center";
		messageContext.fillText(string,x,y,message.width - 100);

	}
}
/**
 * 将数组数字绘制到整个游戏区域
 * @param {string} array 需要转换的数组
 */
function drawArrayIntoNumber(array){
	var canvas = document.getElementById("board");
	var cellWidth = document.getElementById("board").width / 4;
	var cellHeight = document.getElementById("board").height / 4;
	var context = canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);
	for(var i = 0; i < 4; i++){
		for(var j = 0; j < 4; j++){
			fontSize = getNumberFontSize(array[i][j]);
			cellX = cellWidth * j + 135;
			cellY = cellHeight * (i+1) - 35;		
			drawText("board", array[i][j], cellX, cellY, fontSize);
		}
	}
}
/**
 * 将 选定区域 的图像转换成稀疏的像素点阵
 *
 * @param  {string} id 要处理的画布id
 * @param  {number} x 选定区域的起始点坐标x
 * @param  {number} y 选定区域的起始点坐标y
 * @param  {number} width 区域宽
 * @param  {number} height 区域高（方向向下）
 * @return {array} pixelsArray 保存像素坐标的数组
 */
function changeIntoPixel(canvas,x,y,width,height){

	context = canvas.getContext("2d");
	var pixelsArray = [];
	var imgData = context.getImageData(0, 0, width, height);
	context.clearRect(0, 0, width, height);
	for(var i = 0; i < width; i+= 12){
		for(var j = 0; j < height; j+= 12){
			var number = (width * j + i) * 4 + 3 ;
			if(imgData.data[number] > 0.1){
				pixelsArray.push([i,j]);
			}
		}
	}
	return pixelsArray;
}
/**
 * 将像素点数组绘制成圆，用于绘制固定的文字
 * 
 * @param  {array} array 像素点数组
 */
function drawCircle(array){
	var canvas = document.getElementById("board");
	if(canvas.getContext){
		var context = canvas.getContext("2d");		
		for(i = 0; i < array.length; i++){
			context.beginPath();
			context.arc(array[i][0], array[i][1], array[i][2], 0, 2*Math.PI, false);
			// context.fillStyle = "#E8F1F5";	
			context.globalAlpha = array[i][3];
			context.fillStyle = "white";
			context.closePath();
			context.fill();
		}		
	}
}
/**
 * 给像素点数组初始化一个随机的位置，每个像素都对应一个位置
 * 
 * @param  {array} array 像素点数组
 * @return {array} randomArray 随机的初始位置（或者随机的结束位置）
 */
function randomPosition(array){
	var canvas2 = document.getElementById("message");
	var randomArray = [];
	for(var i = 0; i < array.length; i++){
		var randomX = Math.floor(Math.random() * canvas2.width * 2) - Math.floor(Math.random() * canvas2.width);
		var randomY = Math.floor(Math.random() * canvas2.height * 2) -Math.floor(Math.random() * canvas2.height);
		randomArray.push([randomX,randomY]);
	}
	return randomArray;
}
/**
 * 给每个像素点随机一个半径
 * 
 * @param  {array} array 像素点数组
 * @return {array} randomPointRadius 随机的半径
 */
function randomRadius(array){
	var randomPointRadius = [];
	for(var i = 0; i < array.length; i++){
		randomPointRadius.push(Math.floor(Math.random() * 10)+3);
	}
	return randomPointRadius;
}

/**
 * 直线移动方式,有暂停times/2的时间，用作arr->arr之间的移动
 * 
 * @param  {number}	x0 初始坐标
 * @param  {number} y0 初始坐标
 * @param  {number} x1 终点坐标
 * @param  {number} y1 终点坐标
 * @param  {number} flag 当前帧数
 * @param  {number}	times 一次完整效果的帧数
 * @return {array}	point 圆心当前坐标点
 */
function calculateCircleCenterWithStop(x0, y0, x1, y1,flag,times){
	var x,y;
	var point = [];
	var d,dMove;
	if(flag < times / 2){
		point = [x0, y0];
		return point;
	}else{
		d = Math.sqrt(Math.pow((y1 - y0), 2) + Math.pow((x1 - x0), 2));
		if(d === 0){
			point = [x0, y0];
			return point;
		}
		var cFlag = flag - times/2;
		var cTimes = times /2;
		dMove = d - ((d / Math.pow(cTimes, 2)) * Math.pow((cFlag - cTimes), 2));
		x = Math.round((dMove * (x1 - x0)) / d + x0);
		y = Math.round((dMove * (y1 - y0)) / d + y0);
		point = [x, y];
		return point;
	}
}
/**
 * 直线移动方式
 * 
 * @param  {number}	x0 初始坐标
 * @param  {number} y0 初始坐标
 * @param  {number} x1 终点坐标
 * @param  {number} y1 终点坐标
 * @param  {number} flag 当前帧数
 * @param  {number}	times 一次完整效果的帧数
 * @return {array}	point 圆心当前坐标点
 */
function calculateCircleCenter(x0, y0, x1, y1,flag,times){
	var x,y;
	var point = [];
	var d,dMove;
	d = Math.sqrt(Math.pow((y1 - y0), 2) + Math.pow((x1 - x0), 2));
	if(d === 0){
		point = [x0, y0];
		return point;
	}
	dMove = d - ((d / Math.pow(times, 2)) * Math.pow((flag - times), 2));
	x = Math.round((dMove * (x1 - x0)) / d + x0);
	y = Math.round((dMove * (y1 - y0)) / d + y0);
	point = [x, y];
	return point;
}

/**
 * 贝塞尔曲线移动方式
 * 
 * @param  {number}	x0 初始坐标
 * @param  {number} y0 初始坐标
 * @param  {number} x1 终点坐标
 * @param  {number} y1 终点坐标
 * @param  {number} flag 当前帧数
 * @param  {number}	times 一次完整效果的帧数
 * @return {array} point 圆心当前坐标点
 */

function calcutateBZCircleCenter(x0,y0,x1,y1,flag,time){
	var t = flag / time;
	var x = Math.pow((1-t),2)*x0 + 2*t*(1-t)*x0*(flag/30) + Math.pow(t,2)*x1;
	var y = Math.pow((1-t),2)*y0 + 2*t*(1-t)*y1*(flag/30) + Math.pow(t,2)*y1;
	var point = [x, y];
	return point;
}


/**
 * [eventUtil 封装事件监听方法]
 * 
 * @type {Object}
 */
var eventUtil = {
	addHandler : function(element, eventType, handler){
		if(element.addEventListener){
			element.addEventListener(eventType, handler, false);
		}else if(element.attachEvent){
			element.attachEvent("on" + eventType, handler, false);
		}else{
			element["on" + eventType] = handler;
		}
	},
	removeHandler : function(element, eventType, handler){
      if(element.removeEventListener){
        element.removeEventListener(eventType,handler,false);
      }else if(element.detachEvent){
        element.detachEvent("on" + eventType,handler);
      }else{
        element["on" + eventType] = null;
      }
    },

	getEvent : function(event){
		return event ? event : window.event;
	},
};

/**
 * 转置数组
 * 
 * @param  {array} array 要转置的数组
 * @param  {number} derection 需要适配的方向（不是真的转置），向上：0；向右：1；向下&还原向下：2；向左&还原向左：3；还原向上：4；
 * @return {array} exchange 转置后的数组
 *
 * 关于转置还原：向左转的，还原方式为再向左转；向右的不变；向上转的，还原方式为向下转；向下的为向上。
 */
function exchange(array,derection){
	var trans = [[],[],[],[]];
	var i,j;
	switch(derection){
		//上
		case 0:
		for(j = 0; j < 4; j++){
			for(i = 3; i >= 0; i--){
				trans[j].push(array[i][j]);
			}		
		}
		break;
		//右
		case 1:
		trans = array;
		break;
		//下
		case 2:
		for(j = 0; j < 4; j++){
			for(i = 0; i < 4; i++){
				trans[j].push(array[i][j]);
			}
		}
		break;
		//左
		case 3:
		for(i = 0; i < 4; i++){
			for(j = 3; j >=0; j--){
				trans[i].push(array[i][j]);
			}
		}
		break;
		//还原上
		case 4:
		for(j = 3; j >= 0; j--){
			for(i = 0; i < 4; i++){
				trans[Math.abs(j - 3)].push(array[i][j]);
			}
		}
		break;
		default:
		alert("输入了错误的derection值");
	}
	return trans;
}

/**
 * 判断能否移动，是否胜利，是否失败
 * 
 * @param  {array} array 需要判断能否移动及输赢的数组
 * @return {number} winCondition 胜利标志。0:失败； 1:可以继续； 100：胜利；
 */
function winCondition(array){
	var winCondition = 0;
	var arr = [];
	for(var n = 0; n < 4; n++){
		arr = exchange(array, n);
		for(var i = 0; i < 4; i++){		
			for(var j = 0; j < 3; j++){
				var a = arr[i][j];
				var b = arr[i][j+1];
				if(a == 2048){
					winCondition = 100;
					return winCondition;
				}else if(a === 0 || b === 0 || a === b){
					winCondition ++;
				}else{

				}
			}
		}
	}
	if(winCondition > 0){
		winCondition = 1;
		return winCondition;
	}else{
		return winCondition;
	}	
}

/**
 * 创建一个添加一个2的新数组
 * 
 * @param  {array} array 要随机添加一个2的数组，必须要胜利条件为1才能调用该函数
 * @return {array} createNumber 返回一个添加了2之后的新数组
 */
function createNumber(array){
	var arr = [];
	var createNumber = array;
	for(var i = 0; i < 4; i++){
		for(var j = 0; j < 4; j++){
			if(array[i][j] === 0){
				arr.push([i,j]);
			}
		}
	}
	if(arr.length !== 0){
		var a = Math.floor(Math.random() * arr.length);
		createNumber[ arr[a][0] ][ arr[a][1] ] = 2;
	}
	return createNumber;
}

/**
 * 计算数字的大小
 * @param  {number} number 需要计算的数字
 * @return {number}        像素尺寸
 */
function getNumberFontSize(number){
	var fontSize = 0;
	switch(number){
		case 0: fontSize = 0; break;
		case 2: fontSize = 150; break;
		case 4: fontSize = 150; break;
		case 8: fontSize = 150; break;
		case 16: fontSize = 150; break;
		case 32: fontSize = 150; break;
		case 64: fontSize = 150; break;
		case 128: fontSize = 150; break;
		case 256: fontSize = 150; break;
		case 512: fontSize = 150; break;
		case 1024: fontSize = 150; break;
		case 2048: fontSize = 150; break;
	}
	return fontSize;
}


/**
 * 向circlePoolArray添加随机的圆
 * @param {array} array  circlePoolArray
 * @param {number} number 添加多少项
 */
function addRandomCircle(array,number){
	var canvas = document.getElementById("board");
	var w = canvas.width;
	var h = canvas.height;
	for(var i = 0; i < number; i ++){
		var temp = [];
		temp.push(Math.floor(Math.random() * w));
		temp.push(Math.floor(Math.random() * h));
		temp.push(Math.ceil(Math.random() * 3));
		temp.push(0.3);
		array.push(temp.slice(0));
	}
}


/**
 * 单个圆的运动轨迹
 * @param  {array} array1 需要移动的圆数组
 * @param  {array} array2 目标圆数组
 * @param  {num} times  一次完整运动的帧数
 * @param  {num} flag   当前帧数
 * @param  {boolean} Ways   0：曲线运动；1：直线运动
 */
function circleAnimation(array1,array2,times,flag,ways){
	var canvas = document.getElementById("board");
	var drawing = canvas.getContext("2d");
	var cR, cX, cY, alpha, cCenter;
	var cTimes,cFlags;
	if(ways === 0){
		//贝塞尔曲线运动方式
		cCenter = calcutateBZCircleCenter(array1[0], array1[1], array2[0], array2[1], flag, times);
		cR = Math.ceil(((array2[2] - array1[2]) / times) * flag + array1[2]);
		drawing.globalAlpha = ((array2[3] - array1[3]) / times) * flag + array1[3];
	}else if(ways == 1){
		//直线运动方式
		cCenter = calculateCircleCenter(array1[0], array1[1], array2[0], array2[1], flag, times);
		cR = Math.ceil(((array2[2] - array1[2]) / times) * flag + array1[2]);
		drawing.globalAlpha = ((array2[3] - array1[3]) / times) * flag + array1[3];
		//直线运动有暂停
	}else{
		cCenter = calculateCircleCenterWithStop(array1[0], array1[1], array2[0], array2[1], flag, times);
		if(flag < times / 2){
			cTimes = times / 4;
			cR = Math.ceil(((15 - array1[2]) / cTimes) * flag + array1[2]);
		}else{
			cFlags = flag - times/2;
			cTimes = times / 2;
			// cR = Math.ceil(15 * Math.cos(cFlags * Math.PI / (2 * cTimes))) + array2[2];
			cR = Math.ceil(((array2[2] - 15) / cTimes) * cFlags + 15);
		}
		drawing.globalAlpha = ((array2[3] - 0.2) / times) * flag + 0.2;
	}
	cX = cCenter[0];
	cY = cCenter[1];
	
	drawing.beginPath();
	drawing.arc(cX, cY, cR, 0, 2*Math.PI, false);
	
	drawing.fillStyle = "rgb(255,255,255)";		
	drawing.closePath();
	drawing.fill();
}

// 一次动画效果，传入两个参数：这一次的nextNumberArray和上一次的nextNumberArray；这两个值可以在onkeydown
// 之前和之后分别获得，对比这两个数组，将不同的地方的坐标获取，需要炸开和需要生成的；并且建立一个公用的数组，用来制
// 作零散漂浮效果
function animation(currentNumberArray,nextNumberArray){
	var position = [[],[],[],[]];
	var canvas = document.getElementById("board");
	var context = canvas.getContext("2d");
	var circlesNeedToMove = [], circlesFinalPosition = [], circlesKeepStill = [];
	var tempArr = [];
	var w = canvas.width / 4, h = canvas.height / 4;
	var i,j;
	var fontSize,cellX,celly;
	var length;
	var randomNum, randomTemp =[];
	//获得position，position[0],[1]为起始位置，[2],[3]为终点位置	
	switch(derection){
		//右
		case 39:
			for(i = 0; i < 4; i++){
				for(j = 0; j < 4; j++){
					if(currentNumberArray[i][j] !== nextNumberArray[i][j]){
						position[i] = [j*w, i*h, w*4, (i+1)*h];
						break;
					}
				}
			}
		break;
		//上
		case 38:
			for(j = 0; j < 4; j++){
				for(i = 3; i >= 0; i--){
					if(currentNumberArray[i][j] !== nextNumberArray[i][j]){
						position[j] = [j*w, 0, (j+1) * w, (i+1)*h];
						break;
					}
				}
			}
		break;
		//左
		case 37:
			for(i = 0; i < 4; i++){
				for(j = 3; j >= 0; j--){
					if(currentNumberArray[i][j] !== nextNumberArray[i][j]){		
						position[i] = [0, i*h, (j+1)*w, (i+1)*h];
						break;		
					}
				}
			}
		break;
		//下
		case 40:
			for(j = 0; j < 4; j++){
				for(i = 0; i < 4; i++){
					if(currentNumberArray[i][j] !== nextNumberArray[i][j]){						
						position[j] = [j*w, i*h, (j+1)*w, h*4];
						break;
					}
				}
			}
		break;
	}
	//获取需要移动的圆circlesNeedToMove,为了分散效果平均，写成两步；
	for(j = 0; j < circleArray.length; j+=2){
		for(i = 0; i < 4; i++){
			if(circleArray[j][0] > position[i][0] && circleArray[j][0] < position[i][2]){
				if(circleArray[j][1] > position[i][1] && circleArray[j][1] < position[i][3]){
					circlesNeedToMove.push(circleArray[j].slice(0));
				}
			}
		}
	}
	for(j = 1; j < circleArray.length; j+=2){
		for(i = 0; i < 4; i++){
			if(circleArray[j][0] > position[i][0] && circleArray[j][0] < position[i][2]){
				if(circleArray[j][1] > position[i][1] && circleArray[j][1] < position[i][3]){
					circlesNeedToMove.push(circleArray[j].slice(0));
				}
			}
		}
	}
	
	//重绘整个数组,并获得circlesNeedToMove圆的最终位置circlesFinalPosition
	context.clearRect(0,0,canvas.width,canvas.height);
	drawArrayIntoNumber(nextNumberArray);
	tempArr = changeIntoPixel(canvas,0,0,canvas.width,canvas.height);
	//给全局变量circleArray赋值
	// circleArray.length = 0;
	circleArray = tempArr.slice(0);
	//获取circlesFinalPosition，也就是需要移动的圆的最终位置，以及获取不需要移动的圆的位置
	for(i = 0; i < tempArr.length; i++){
		tempArr[i].push(R);
		tempArr[i].push(1);
	}
	for(i = 0; i < 4; i++){
		for(j = 0; j < tempArr.length; j++){
			if(tempArr[j][0] > position[i][0] && tempArr[j][0] < position[i][2]){
				if(tempArr[j][1] > position[i][1] && tempArr[j][1] < position[i][3]){
					circlesFinalPosition.push(tempArr[j].slice(0));
				}
			}
		}
	}
	for(i = 0; i < tempArr.length; i++){
		if(tempArr[i][0] > position[0][0] && tempArr[i][0] < position[0][2] &&
			tempArr[i][1] > position[0][1] && tempArr[i][1] < position[0][3]){
			continue;
		}
		if(tempArr[i][0] > position[1][0] && tempArr[i][0] < position[1][2] &&
			tempArr[i][1] > position[1][1] && tempArr[i][1] < position[1][3]){
			continue;
		}
		if(tempArr[i][0] > position[2][0] && tempArr[i][0] < position[2][2] &&
			tempArr[i][1] > position[2][1] && tempArr[i][1] < position[2][3]){
			continue;
		}
		if(tempArr[i][0] > position[3][0] && tempArr[i][0] < position[3][2] &&
			tempArr[i][1] > position[3][1] && tempArr[i][1] < position[3][3]){
			continue;
		}
		circlesKeepStill.push(tempArr[i].slice(0));
	}

	//重新绘制回currentNumberArray状态，恢复为了操作
	context.clearRect(0,0,canvas.width,canvas.height);
	drawArrayIntoNumber(currentNumberArray);
	tempArr = changeIntoPixel(canvas,0,0,canvas.width,canvas.height);
	for(i = 0 ; i < tempArr.length; i++){
		tempArr[i].push(R);
		tempArr[i].push(1);
	}
	drawCircle(tempArr);
	drawCircle(circlePoolArray);
	//动画
	animationWhenPress(circlesNeedToMove,circlesFinalPosition,circlesKeepStill,position);
}


/**
 * 数字移动函数 只在animation中调用
 * @param  {array} circlesNeedToMove    当前帧的需要移动的数组
 * @param  {array} circlesFinalPosition 下一帧移动之后的数组
 * @param  {array} position             需要移动的区域
 */
function animationWhenPress(circlesNeedToMove,circlesFinalPosition,circlesKeepStill,position){
	var times = 40;
	var time = 20;
	var flag = 0, addNumberFlag = 0;
	var refreshFlag = 0;
	var temp = [];
	var circlesMoveToPool = [];
	var i,j,len;
	var canvas = document.getElementById("board");
	var drawing = canvas.getContext("2d");
	if(circlesNeedToMove.length === 0){
		keydownFlag = 1;
		clearInterval(animates);
		return 0;	
	}
	var animates = setInterval(function(){

		
		//清除整个页面
		drawing.clearRect(0, 0, canvas.width, canvas.height);

		//绘制动的地方
	
		//cF > cN
		if(circlesFinalPosition.length > circlesNeedToMove.length){
			// cF > cN + p
			if(circlesFinalPosition.length >= circlesNeedToMove.length + circlePoolArray.length){
				len = circlesFinalPosition.length - temp.length;
				addRandomCircle(circlePoolArray,len);
				//cN --> cF
				for(i = 0; i < circlesNeedToMove.length; i++){
					circleAnimation(circlesNeedToMove[i], circlesFinalPosition[i], times, flag, 2);
				}
				//p --> cF
				if(flag === 0){
					temp = circlePoolArray.splice(0,circlePoolArray.length);
				}
				for(i = 0; i < temp.length; i++){
					circleAnimation(temp[i], circlesFinalPosition[i], times, flag, 1);
				}

			//cF < cN + p
			}else{
				len = circlesFinalPosition.length - circlesNeedToMove.length;
				if(flag === 0){
					temp = circlePoolArray.splice(0,len);
				}
				// cN --> cF
				for(i = 0; i < circlesNeedToMove.length; i++){
					circleAnimation(circlesNeedToMove[i], circlesFinalPosition[i], times, flag, 2);
				}
				// 部分p --> cF
				for(i = 0; i < temp.length; i++){
					circleAnimation(temp[i], circlesFinalPosition[i], times, flag, 1);
				}	
			}

		//cF < cN
		}else if(circlesFinalPosition.length < circlesNeedToMove.length){
			len = circlesNeedToMove.length - circlesFinalPosition.length;
			temp = circlesNeedToMove.slice(0, circlesFinalPosition.length);
			// 部分cN --> cF
			for(i = 0; i < circlesFinalPosition.length; i++){
				circleAnimation(temp[i], circlesFinalPosition[i], times, flag, 2);
			}
			//创建circlesNeedToMove需要移动到Pool中的最终位置，保证移动到pool之后的半径小于R
			// 部分cN --> p
			if(flag === 0){
				addRandomCircle(circlesMoveToPool,len);
			}
			temp = circlesNeedToMove.slice(circlesFinalPosition.length);
			for(j = 0; j < temp.length; j++){
				circleAnimation(temp[j], circlesMoveToPool[j], times, flag, 1);
			}
			if(flag === times){
				circlePoolArray = circlePoolArray.concat(circlesMoveToPool);
			}
		//cF = cN
		}else{
			//cN --> cF
			temp = circlesNeedToMove.slice(0);
			for(i = 0; i < circlesFinalPosition.length; i++){
				circleAnimation(temp[i], circlesFinalPosition[i], times, flag, 2);
			}	
		}
		//绘制不动的地方
		for(i = 0; i < circlesKeepStill.length; i++){
			circleAnimation(circlesKeepStill[i], circlesKeepStill[i], times, flag, 1);
		}
		//绘制poolarray
		for(i = 0; i < circlePoolArray.length; i++){
			circleAnimation(circlePoolArray[i], circlePoolArray[i], times, flag, 1);
		}

		if(flag == times){
			//重置currentNumberArray
			currentNumberArray = nextNumberArray;
			clearInterval(animates);
		}
		flag++;	
	}, time);
	
	var arr = [];
	var tempPool = [];
	var temp1 = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
	var a;
	//添加一个2
	var addNumber = setInterval(function(){
		if(flag > times){
			winFlag = winCondition(currentNumberArray);
			//判断胜利条件
			if(winFlag === 1){
				if(addNumberFlag === 0){
					for(i = 0; i < 4; i++){
						for(j = 0; j < 4; j++){
							if(currentNumberArray[i][j] === 0){
								arr.push([i,j]);
							}
						}
					}
					if(arr.length !== 0){
						a = Math.floor(Math.random() * arr.length);
						temp1[ arr[a][0] ][ arr[a][1] ] = 2;
						//给currentNumberArray赋值
						currentNumberArray[ arr[a][0] ][ arr[a][1] ] = 2;
					}
					//单独绘制需要添加的数字
					drawing.clearRect(0, 0, canvas.width, canvas.height);
					drawArrayIntoNumber(temp1);
					singleNumberArray = changeIntoPixel(canvas,0,0,canvas.width,canvas.height);
					for(i = 0; i < singleNumberArray.length; i ++){
						singleNumberArray[i].push(R);
						singleNumberArray[i].push(1);
					}
				}

				drawing.clearRect(0, 0, canvas.width, canvas.height);
				//原先数组描绘
				for(i = 0; i < circleArray.length; i++){
					circleAnimation(circleArray[i], circleArray[i], times, addNumberFlag, 1);
				}
				//添加单独数字动画
				if(singleNumberArray.length > circlePoolArray.length){
					addRandomCircle(circlePoolArray,singleNumberArray.length - circlePoolArray.length);
					if(addNumberFlag === 0){
						tempPool  = circlePoolArray.splice(0,circlePoolArray.length);
					}
					for(i = 0; i < tempPool.length; i++){
						circleAnimation(tempPool[i], singleNumberArray[i], times, addNumberFlag, 1);
					}
				}else{
					if(addNumberFlag === 0){
						tempPool = circlePoolArray.splice(0,singleNumberArray.length);
					}
					for(i = 0; i < tempPool.length; i++){
						circleAnimation(tempPool[i], singleNumberArray[i], times, addNumberFlag, 1);
					}
				}
				//绘制poolarray
				for(i = 0; i < circlePoolArray.length; i++){
					circleAnimation(circlePoolArray[i], circlePoolArray[i], times, flag, 1);
				}

				addNumberFlag++;


			}else if(winFlag === 100){
				keydownFlag = 1;
				clearInterval(addNumber);
				setTimeout(function(){
					winAnimation(0);
				},500);
			}else{
				keydownFlag = 1;
				clearInterval(addNumber);
				setTimeout(function(){
					winAnimation(1);
				},500);
			}
			if(addNumberFlag > times){
				keydownFlag = 1;
				circleArray = circleArray.concat(singleNumberArray.slice(0));
				clearInterval(addNumber);
			}

		}
	},time);
}

/**
 * 添加键盘方向键点击事件
 * 
 * @param  {event} event
 */
function keyDown(event){

		if(keydownFlag === 0){
			return 0;
		}
		keydownFlag = 0;

		winFlag = winCondition(currentNumberArray);
		if(winFlag === 100){
			keydownFlag = 1;
			setTimeout(function(){
				winAnimation(0);
			},500);
			return 0;
		}else if(winFlag === 0){
			keydownFlag = 1;
			setTimeout(function(){
				winAnimation(1);
			},500);
			return 0;
		}
		//复原标志
		var flag = 0;
		var arrWithoutZero = [[],[],[],[]];
		var arrTemp = [[],[],[],[]];
		var arr = [[],[],[],[]];
		var cATemp = [];
		block:
		{	

			switch(event.keyCode){
				case 38: cATemp = exchange(currentNumberArray,0); flag = 4; break;
				case 39: cATemp = exchange(currentNumberArray,1); flag = 1; break;
				case 40: cATemp = exchange(currentNumberArray,2); flag = 2; break;
				case 37: cATemp = exchange(currentNumberArray,3); flag = 3; break;
				default: keydownFlag = 1; break block;		
			}
			derection = event.keyCode;
			//清洗数组中的0；
			for(var i = 0; i < 4; i++){
				for(var j = 0; j <4; j++){
					if(cATemp[i][j] > 1){
						arr[i].push(cATemp[i][j]);	
					}
				}
			}
			arrWithoutZero = arr;
			//合并相连的相同项；
			for(var a = 0; a < 4; a++){
				//空
				if(arrWithoutZero[a].length < 1){
					continue;
				//1个数
				}else if(arrWithoutZero[a].length === 1){
					arrTemp[a].unshift(arrWithoutZero[a][0]);
				//大于1个数
				}else{
					for(var b = arrWithoutZero[a].length - 1; b >= 0; ){
						try{
							if(arrWithoutZero[a][b-1] !== arrWithoutZero[a][b]){
								arrTemp[a].unshift(arrWithoutZero[a][b]);
								b--;
							}else{
								arrTemp[a].unshift(arrWithoutZero[a][b] * 2);
								b-=2;
							}
						}catch(err){
							arrTemp[a].unshift(arrWithoutZero[a][b]);
						}
					}
				}	
			}
			//添加0
			for(var x = 0; x < 4; x++){
				for(var y = arrTemp[x].length; y < 4; y++){
					arrTemp[x].unshift(0);
				}
			}
			//还原数组
			switch(flag){
				case 4: 
				arr = exchange(arrTemp,4);
				break;
				case 1: 
				arr = arrTemp;
				break;
				case 2: 
				arr = exchange(arrTemp,2);
				break;
				case 3: 
				arr = exchange(arrTemp,3);
				break;				
			}

			//给全局变量nextNumberArray赋值
			nextNumberArray = arr;
			//动画
			animation(currentNumberArray,nextNumberArray);
		}
	}
function onKeydown(event){
	eventUtil.addHandler(document,"keydown",keyDown);
}

/**
 * 执行动画 取变量circleArray，circlePoolArray，nextCircleArray的值，并在执行完动画之后赋予它们新的值
 */
function gameBoardInitAnimation(){
	var times = 50;
	var time = 12;
	var flag = 0;
	var refreshFlag = 0;
	var temp = [], circleToPool = [];
	var i,j,len;
	var canvas = document.getElementById("board");
	var drawing = canvas.getContext("2d");
	var animates = setInterval(function(){
		//清除上一帧	
		drawing.clearRect(0,0,canvas.width,canvas.height);
		//nA > A
		if(nextCircleArray.length > circleArray.length){
			// nA > A + p
			if(nextCircleArray.length >= circleArray.length + circlePoolArray.length){
				temp = circleArray.concat(circlePoolArray);
				len = nextCircleArray.length - temp.length;
				addRandomCircle(temp,len);

				for(i = 0; i < nextCircleArray.length; i++){
					circleAnimation(temp[i], nextCircleArray[i], times, flag, 1);
				}
			//nA < A + p
			}else{
				len = nextCircleArray.length - circleArray.length;
				temp = circlePoolArray.slice(0,len);
				temp = temp.concat(circleArray);

				for(i = 0; i < nextCircleArray.length; i++){
					circleAnimation(temp[i], nextCircleArray[i], times, flag, 1);
				}
			}
		//nA < A
		}else if(nextCircleArray.length < circleArray.length){
			len = circleArray.length - nextCircleArray.length;
			temp = circleArray.slice(0, nextCircleArray.length);	
			for(i = 0; i < nextCircleArray.length; i++){
				circleAnimation(temp[i], nextCircleArray[i], times, flag, 1);
			}
			if(flag === 0){
				addRandomCircle(circleToPool, len);
			}	
			temp = circleArray.slice(nextCircleArray.length);
			for(j = 0; j < temp.length; j++){
				circleAnimation(temp[j], circleToPool[j], times, flag, 1);
			}

		//nA = A
		}else{
			for(i = 0; i < nextCircleArray.length; i++){
				circleAnimation(circleArray[i], nextCircleArray[i], times, flag, 1);
			}		
		}
		//绘制poolarray
		for(i = 0; i < circlePoolArray.length; i++){
			circleAnimation(circlePoolArray[i], circlePoolArray[i], times, flag, 1);
		}

		flag++;
		if(flag > times){
			clearInterval(animates);
		}			
	}, time);
	var refresh = setInterval(function(){
		if(flag > times){
			//刷新circleArray，circlePoolArray值；
			//nA > A
			if(nextCircleArray.length > circleArray.length){
				// nA > A + p
				if(nextCircleArray.length >= circleArray.length + circlePoolArray.length){
					temp = circleArray.concat(circlePoolArray.slice(0));
					circleArray = nextCircleArray;
					circlePoolArray.length = 0;
				//nA < A + p
				}else{
					len = nextCircleArray.length - circleArray.length;
					circleArray = nextCircleArray;
					circlePoolArray = circlePoolArray.slice(len);
				}
			//nA < A
			}else if(nextCircleArray.length < circleArray.length){
				circlePoolArray = circlePoolArray.concat(circleToPool.slice(0));
				circleArray = nextCircleArray;	
			//nA = A
			}else{
				circleArray = nextCircleArray;
			}
			refreshFlag++;
		}
		if(refreshFlag > 0){
			clearInterval(refresh);
		}
	}, 100);	
}

/**
 * 初始化游戏界面
 */
function initGameBoard(test){
	var h = document.body.offsetHeight;
	var w = document.body.offsetWidth;
	if(h < 0){
		h = 0;
	}
	if(w < 1100){
		w = 1100;
	}
	document.getElementById("bg").style.height = h + "px";
	document.getElementById("bg").style.width = w + "px";
	var cell = document.getElementsByClassName("cellDiv");
	var i = 0;
	var canvas = document.getElementById("board");
	var context = canvas.getContext("2d"); 
	var boardArray = [];
	var temp;	
	if(test === 0){
		boardArray = [[1024,1024,0,0],[1024,0,0,0],[0,0,0,0],[0,0,0,0]];
	}else if(test === 1){
		boardArray = [[2,4,8,16],[32,64,128,256],[512,1024,2,4],[8,16,32,0]];
	}else{
		for(i = 0; i < 4; i++){
			boardArray.push([0,0,0,0]);
		}	
	}	
	boardArray = createNumber(boardArray);
	boardArray = createNumber(boardArray);
	drawArrayIntoNumber(boardArray);
	temp = changeIntoPixel(canvas,0,0,canvas.width,canvas.height);
	for(i = 0; i < temp.length; i++){
		temp[i].push(R);
		temp[i].push(1);
	}
	currentNumberArray = boardArray.slice(0);
	nextCircleArray.length = 0;
	nextCircleArray = temp.slice(0);
	//执行动画
	gameBoardInitAnimation();
	//显示框框
	var a = 0;
	var showCell = setInterval(function(){
		cell[a].style.visibility = "visible";
		a++;
		if(a >= cell.length){
			clearInterval(showCell);
		}
	},100);
	winFlag = 1;
	setTimeout(function(){
		keydownFlag = 1;
	},2500);
	
}
/**
 * 绘制开场动画字符串
 * @param  {string} string 输入文字
 * @return {string}        转化成的圆数组
 */
function initCircleArray(string){
	var canvas = document.getElementById("board");
	var context = canvas.getContext("2d");
	var arr = [];
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawOpenningText("board",string, canvas.width/2, canvas.height/2 + 50,260);
	arr = changeIntoPixel(canvas,0,0,canvas.width,canvas.height);
	for(i = 0; i < arr.length; i++){
		arr[i].push(R);
		arr[i].push(1);
	}
	return arr;
}
/**
 * 开场动画
 */
function openningAnimation(){
	keydownFlag = 0;
	var canvas = document.getElementById("board");
	var context = canvas.getContext("2d");
	var cell = document.getElementsByClassName("cellDiv");
	var i;
	for(i = 0; i < cell.length; i++){
		cell[i].style.visibility = "hidden";
	}
	circlePoolArray.length = 0;
	circleArray.length = 0;
	addRandomCircle(circlePoolArray,2000);
	var arr1 = initCircleArray("if you");
	var arr2 = initCircleArray("wanna,");
	var arr3 = initCircleArray("make it");
	var arr4 = initCircleArray("happen!");
	nextCircleArray = arr1;
	gameBoardInitAnimation();
	setTimeout(function(){
		nextCircleArray = arr2;
		gameBoardInitAnimation();
	}, 1700);
	setTimeout(function(){
		nextCircleArray = arr3;
		gameBoardInitAnimation();
	}, 4000);
	setTimeout(function(){
		nextCircleArray = arr4;
		gameBoardInitAnimation();
	}, 5800);
	setTimeout(function(){
		nextCircleArray = [];
		gameBoardInitAnimation();
	}, 8500);
}
/**
 * 胜利/失败 动画
 */
function winAnimation(win){
	var canvas = document.getElementById("board");
	var cell = document.getElementsByClassName("cellDiv");
	var context = canvas.getContext("2d");
	var tempPoolArray = [];
	var anotherFlag = 0;
	var len = circleArray.length;
	var i = 0, j = 0;
	addRandomCircle(tempPoolArray, len);

	var moveTopool = setInterval(function(){
		context.clearRect(0,0,canvas.width,canvas.height);
		for(i = 0; i < circleArray.length; i++){
			circleAnimation(circleArray[i], tempPoolArray[i], 50, anotherFlag, 1);
		}
		for(j = 0; j < circlePoolArray.length; j++){
			circleAnimation(circlePoolArray[j], circlePoolArray[j], 50, anotherFlag, 1);
		}
		anotherFlag++;
		if(anotherFlag > 50){
			circlePoolArray = circlePoolArray.concat(tempPoolArray.slice(0));
			circleArray.length = 0;
			if(win === 0){
				var arr = initCircleArray("congratulations");
				nextCircleArray.length = 0;
				nextCircleArray = arr;
				eventUtil.removeHandler(document,"keydown",keyDown);
				for(i = 0; i < cell.length; i++){
					cell[i].style.visibility = "hidden";
				}
				gameBoardInitAnimation();
			}else{
				var arr1 = initCircleArray("try again");
				nextCircleArray.length = 0;
				nextCircleArray = arr1;
				eventUtil.removeHandler(document,"keydown",keyDown);
				for(i = 0; i < cell.length; i++){
					cell[i].style.visibility = "hidden";
				}
				gameBoardInitAnimation();
			}
			clearInterval(moveTopool);		
		}
	},15);
}
/**
 * 重启
 */
function addRestEvent(event){
	var restButton = document.getElementById("rest");
	eventUtil.addHandler(restButton,"click",function(){
		if(keydownFlag === 1){
			openningAnimation();
			setTimeout(function(){
				initGameBoard();
				onKeydown(event);
			},9500);
		}		
	});
}
/**
 * 显示信息
 */
function addMessageEvent(event){
	var messageButton = document.getElementById("message");
	var cell = document.getElementsByClassName("cellDiv");
	eventUtil.addHandler(messageButton,"click",function(){
		if(keydownFlag === 1){
			keydownFlag = 0;
			var a = 0;
			for(i = 0; i < cell.length; i++){
				cell[i].style.visibility = "hidden";
			}
			var message1 = initCircleArray("powered by");
			var message2 = initCircleArray("Weng.Z.S");
			var temp = circleArray.slice(0);
			nextCircleArray = message1;
			gameBoardInitAnimation();
			setTimeout(function(){
				nextCircleArray = message2;
				gameBoardInitAnimation();
			}, 2000);
			setTimeout(function(){
				nextCircleArray = temp;
				gameBoardInitAnimation();
				if(winFlag == 1){
					var showCell = setInterval(function(){
						cell[a].style.visibility = "visible";
						a++;
						if(a >= cell.length){
							clearInterval(showCell);
						}
					},100);	
				}
			},4000);
			setTimeout(function(){
				keydownFlag = 1;
			},6400);

		}
	});
}
/**
 * 胜利测试
 */
function testWin(){
	var testWinButton = document.getElementById("testWin");
	eventUtil.addHandler(testWinButton,"click",function(){
		if(keydownFlag === 1){
			openningAnimation();
			setTimeout(function(){
				initGameBoard(0);
				onKeydown(event);
			},9500);
		}
	});
}
/**
 * 失败测试
 */
function testLose(){
	var testLoseButton = document.getElementById("testLose");
	eventUtil.addHandler(testLoseButton,"click",function(){
		if(keydownFlag === 1){
			openningAnimation();
			setTimeout(function(){
				initGameBoard(1);
				onKeydown(event);
			},9500);
		}
	});
}
window.onload = function(){
	addRestEvent(event);
	addMessageEvent(event);
	testWin();
	testLose();
	openningAnimation();
	setTimeout(function(){
		initGameBoard();
		onKeydown(event);
	},9500);	
};
