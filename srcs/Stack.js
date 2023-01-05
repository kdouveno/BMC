module.exports = class Stack{
	constructor()
	{
		this.config = {
			decks: {}
		},
		this.pile = [],
		this.discard = []
	}

	draw() {
		return this.pile.pop();
	}

	discard() {
		
	}

	generatePile() {
		
	}
}