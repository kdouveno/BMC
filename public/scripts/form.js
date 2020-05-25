function KDformInit(){
	KDform.setNumInputs();
	KDform.setCheckInputs();
}

var KDform = {
	objForm: function(sel){
		var out = {};
		$(sel + " input[name]").each((i, o) => {
			if ($(o).hasClass("numberInput"))
				out[o.name] = parseInt(o.value);
			else if ($(o).attr("type") == "checkbox")
				out[o.name] = o.checked;
			else
				out[o.name] = o.value;
		});
		return out;
	},
	inject: function(selector, obj) {
		if (typeof(obj) != "object")
			return ;
		Object.keys(obj).forEach((key) => {
			var sel = $(selector + " input[name="+ key +"]").get(0);
			if (u.isndef(sel)){
				return ;
			}
			if (typeof(obj[key]) == "boolean"){
				sel.checked = obj[key];
				this.checkEvent(sel);
			}
			else if (!u.isndef(obj[key])){
				sel.value = obj[key];
			}
		});
	},
	setNumInputs: function(selector)
	{
		$((selector ? selector : "") +" input[type=number]").each((i, o) => {
			$(o).replaceWith(`<div class="inputLike numInput">
				<div onclick='KDform.numMinus(this)'>-</div>
				<input class="numberInput" value="`+(isNaN($(o).attr("value")) ? 0 : $(o).attr("value"))+`" name="`+ $(o).attr("name") +`" oninput="KDform.numEvent(this)" onchange="KDform.numUnEvent(this)"/>
				<div onclick='KDform.numPlus(this)'>+</div>
			</div>`);
		});
	},
	numEvent: function(e){
		var test = /-/.test(e.value) && !/\+/.test(e.value);
		e.value = parseInt(e.value.replace(/[^0-9]*/g, ""));
		if (test)
			e.value = "-" + e.value;
	},
	numUnEvent: function(e)
	{
		var out = parseInt(e.value);
		e.value = isNaN(out) ? 0 : out;
	},
	numPlus: (e)=>{
		if ($(e).is("fieldset[disabled] *"))
			return ;
		var input = $(e).siblings("input").get(0);
		input.value = parseInt(input.value) + 1;
	},
	numMinus: (e)=>{
		if ($(e).is("fieldset[disabled] *"))
			return ;
		var input = $(e).siblings("input").get(0);
		input.value = parseInt(input.value) - 1;
	},
	setCheckInputs: function()
	{
		$("input[type=checkbox]").each((i, o) => {
			var je = $(o);
			je.replaceWith(`<div class="inputLike checkInput `+ (je.get(0).checked ? `checked` : ``) +`">
				<div class="under">
					<div>on</div>
					<div>off</div>
				</div>
				<div class="hover">
					<div>on</div>
					<div>off</div>
				</div>
				<input name="`+ $(o).attr("name") +`" type="checkbox" oninput="KDform.checkEvent(this); `+ je.attr("oninput") +`" onchange="KDform.checkEvent(this)" `+ (je.get(0).checked ? `checked` : ``) +`/>
			</div>`);
		});
	},
	checkEvent: (e)=>{
		var p = $(e).parent();
		if (e.checked)
			p.addClass("checked");
		else {
			p.removeClass("checked");
		}
	}
}
