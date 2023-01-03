const fs = require('fs');

module.exports = class bmcDeck {
	constructor(code5){
		if(code5)
			this.loadDeck(code5);
	}

	loadDeck(code5){
		fs.readdir('./decks', (err, files)=>{
			if (err)
				throw err;
			files.forEach((fn)=>{
				if (fn.slice(0,5) === code5){
					fs.readFile('./decks/' + fn, (err, data)=>{
						if (err) throw err;
						this.parseDeckData(data);
					})
				}
			});
		});
	}
	parseDeckData(data){
		var o = JSON.parse(data);
		Object.assign(this, o); //NEED TO BE SECURED	
	}
}