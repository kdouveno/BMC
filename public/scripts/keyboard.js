pressed={};
document.onkeydown=function(e){
	e = e || window.event;
	pressed[e.keyCode] = true;
}

document.onkeyup=function(e){
	e = e || window.event;
	delete pressed[e.keyCode];
}
