var u = {
	isndef(o) {
		return (typeof(o) === "undefined");
	},
	shuffle(t) {
		var out = [];
		var tab = [].concat(t);
		while (tab.length) {
			var r = Math.floor(Math.random() * tab.length);
			out.push(tab.splice(r, 1)[0]);
		}
		return out;
	},
	multiply(t, n) {
		var out = [];
		for(var i = 0; i < n; i++){
			out.push(...t);
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
	},
	href: {
		append(query, value){
			if (typeof(query) !== "string")
				throw "invalid type";
			var href = window.location.href;
			if (href.includes(query)) {
				href = href.replace(new RegExp(`${query}=[\\w-]*`), query + "=" + value);
			} else {
				if (href.includes("?"))
					href += "&";
				else
					href += "?";
				href += query + "=" + value;
			}
			history.pushState({}, '', href);
		}
	},
	gebid: (id) => document.getElementById(id)
}

if (typeof(module) !== "undefined")
	module.exports = u;
