ui = {
	displayGameUI: function () {
		$("#loginContainer").addClass("hidden");
	},
	animSwitch: e => {
		console.log(e.checked);
		$("body").css("--at", e.checked ? "1" : "0");
	}
};