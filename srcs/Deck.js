const fs = require('fs');

module.exports = class bmcDeck {
	constructor(code5, callback){
		if(code5)
			this.loadDeck(code5, callback);
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

	
}