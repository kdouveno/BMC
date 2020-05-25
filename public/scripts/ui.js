var ui = {
	displayGameUI: function(){
		$("#loginContainer").addClass("hidden");
	},
	animSwitch: (e) => {
		$("body").css("--at", (e.checked ? "1" : "0"));
	},
	updateAdminRight: function(hasAdminRight) {
		if (hasAdminRight) {
			$(".modOnly").attr("disabled", null);
		} else {
			$(".modOnly").attr("disabled", true);
		}
	}
}