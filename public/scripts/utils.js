var u = {
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
				fxsObject[o](data, soc);
			});
		});
	},
	unregisterEvents: function(soc, fxsObject) {
		Object.keys(fxsObject).forEach(function(o) {
			soc.off(o, function(data){
				fxsObject[o](data, soc);
			});
		});
	},
	getUrlVars: function() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	assignForm(id, obj) {
		Object.keys(obj).forEach(k => {
			var e = $("form#" + id + " input[name=" + k + "]");
			if (e.is("[type=checkbox]")) {
				if (obj[k] == "false")
					e.attr("checked", null);
				else
					e.attr("checked", "checked");
			} else {
				e.val(obj[k]);
			}
			e.trigger("input");
		});
	},
	strictTest(str, rgx) {
		var test = str.match(rgx);
		if (test)
			return test[0] == str;
		return false;
	}
}

if (typeof(module) !== "undefined")
	module.exports = u;
