u = {
	isndef: function(o) {
		return (typeof(o) === "undefined");
	},
	shuffle: function(t) {
		var out = [];
		var tab = [].concat(t);
		while (tab.length) {
			var r = Math.floor(Math.random() * tab.length);
			out.push(tab.splice(r, 1)[0]);
		}
		return out;
	},
	registerEvents: function(soc, fxsObject) {
		Object.keys(fxsObject).forEach(function(o) {
			soc.on(o, function(data){
				fxsObject[o](soc, data);
			});
		});
	}
}

if (typeof(module) !== "undefined")
	module.exports = u;
