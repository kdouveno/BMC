const { throws } = require('assert');
const fs = require('fs');

module.exports = class bmcDeck {
	constructor(code5, callback){
		this.resMultiplier = 1;
		this.callMultiplier = 1;
		if(code5)
			this.loadDeck(code5, callback);
			// 
			// 	name: "TestDeck",
			// 	author: "Isordee",
			// 	languages: "en",
			// 	code5: "00001",
			// 	nsfw: true,
			// 	deck: {
			// 		calls: [
			// 			{
			// 				content: "Coming to Broadway this season, $: The Musical !",
			// 				nbrRes: 1
			// 			},
			// 		],
			// 		res: [
			// 			{"content": "dying of dysentery"},
			// 		]
			// 	}
			// 
	}

	loadDeck(code5, callback){
		fs.readdir('./decks', (err, files)=>{
			if (err)
				throw err;
			files.forEach((fn)=>{
				if (fn.slice(0,5) === code5){
					fs.readFile('./decks/' + fn, (err, data)=>{
						if (err) throw err;
						this.parseDeckData(data);
						callback(this);
					})
				}
			});
		});
	}
	parseDeckData(data){
		var o = JSON.parse(data);
		Object.assign(this, o); //NEED TO BE SECURED
		this.addData();
	}

	addData(){
		function addCallData(o){
			o.nbrRes = o.content.split('$').length - 1;
		}
		this.deck.calls.forEach(addCallData);
	}

	getCallStock(){
		var out = [];
		for (var i = 0; i < this.deck.calls.length; i++)
			out[i] = i;
		for (var i = 0; i <= this.callMultiplier; i++)
			out.concat(out);
		return out;
	}

	getResStock(){
		var out = [];
		for (var i = 0; i < this.deck.res.length; i++)
			out[i] = i;
		for (var i = 0; i <= this.resMultiplier; i++)
			out.concat(out);
		return out;
	}
}