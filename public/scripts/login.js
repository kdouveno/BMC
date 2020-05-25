var events = function(){
	$("#loginContainer").keydown(e => {
		if (e.key == "Enter")
			enter();
	});
	$("#refColor").keydown(e => {
		if(/Tab|Escape/.test(e.key))
			$("#refColor").get(0).jscolor.hide();
	}).focusin(() => {
		$("#refColor").get(0).jscolor.show();
	});
}

var login = {
	login: function(){
		events();
		$("#tokenInput").attr("value", getToken());
		login.changeEnter($("#tokenInput").get(0));
	},
	changeEnter: function(e){
		if (e.value == "")
			$("#enter").removeClass("join");
		else
			$("#enter").addClass("join");
	}
}
