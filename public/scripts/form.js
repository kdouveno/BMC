form = {
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
				<div onclick='form.numMinus(this)'>-</div>
				<input value="`+$(o).attr("value")+`"/>
				<div onclick='form.numPlus(this)'>+</div>
			</div>`);
		});
	},
	numPlus: (e)=>{
		input = $(e).siblings("input").get(0);
		input.value = parseInt(input.value) + 1;
	},
	numMinus: (e)=>{
		input = $(e).siblings("input").get(0);
		input.value = parseInt(input.value) - 1;
	}
}
