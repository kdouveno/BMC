function KDformInit(){
	KDform.setNumInputs();
	KDform.setCheckInputs();
}

KDform = {
	objForm: function(sel){
		return $(sel).serializeArray().reduce(function(t, o){
			t[o.name] = o.value;
			return t;
		}, {});
	},
	setNumInputs: function()
	{
		$("input[type=number]").each((i, o) => {
			$(o).replaceWith(`<div class="inputLike numInput">
				<div onclick='KDform.numMinus(this)'>-</div>
				<input value="`+(isNaN($(o).attr("value")) ? 0 : $(o).attr("value"))+`" oninput="KDform.numEvent(this)" onchange="KDform.numUnEvent(this)"/>
				<div onclick='KDform.numPlus(this)'>+</div>
			</div>`);
		});
	},
	numEvent: function(e){
		var test = /-/.test(e.value) && !/\+/.test(e.value);
		e.value = e.value.replace(/[^0-9]*/g, "");
		if (test)
			e.value = "-" + e.value;
	},
	numUnEvent: function(e)
	{
		var out = parseInt(e.value);
		e.value = isNaN(out) ? 0 : out;
	},
	numPlus: (e)=>{
		var input = $(e).siblings("input").get(0);
		input.value = parseInt(input.value) + 1;
	},
	numMinus: (e)=>{
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
				<input type="checkbox" oninput="KDform.checkEvent(this)" `+ (je.get(0).checked ? `checked` : ``) +`/>
			</div>`);
		});
	},
	checkEvent: (e)=>{
		console.log(e.checked);
		var p = $(e).parent();
		if (e.checked)
			p.addClass("checked");
		else {
			p.removeClass("checked");
		}
	}
}
