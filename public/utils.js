u = {
	isndef: function(o) {
		return (typeof(o) === "undefined");
	}
}

if (typeof(module) !== "undefined")
	module.exports = u;
