class Deck extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			value: undefined
		}

		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(e){
		this.setState({value: e.target.value.replace(/[^0-9]+/g, "")});
	}
	handleBlur(e){
		socket.emit("setMultiplier", {code5: this.props.code5, value: e.target.value});
	}
	render(){
		console.log(this.multiplier);
		return (
			<tr id={this.props.code5} className="deck">
				<td>{this.props.code5}</td>
				<td>
					<input
						name={this.props.code5}
						type="text"
						value={this.state.value ?? this.props.multiplier}
						onChange={this.handleChange}
						onBlur={this.handleBlur.bind(this)}
					/>
				</td>
				<td>{this.props.name}</td>
				<td>{this.props.nbrCalls}</td>
				<td>{this.props.nbrRes}</td>
			</tr>
		);
	}
}

var DeckContainer = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			decks: BMC.decks
		};
		this.events = {
			updateDecks: (decksLib)=>{
				this.setState({decks: BMC.decks = decksLib});
			}
		}

		this.addDeck = this.addDeck.bind(this);
	}

	addDeck(e){
		e = u.gebid("addDeck").value;
		if (e.replace(/[0-9A-Z]{5}?/, "") == ""){
			socket.emit("addDeck", e);
		}
	}

	componentDidMount() {
		u.registerEvents(socket, this.events);
	}
	componentWillUnmount() {
		u.unregisterEvents(socket, this.events);
	}

	render() {
		return <table>
				<thead>
					<tr>
						<th>CODE5</th>
						<th>Count</th>
						<th>Name</th>
						<th>Calls</th>
						<th>Responses</th>
					</tr>
					<tr id="deckAdd">
						<td>
							<input id="addDeck" placeholder="CODE5" style={{width: "5em"}} />
						</td>
						<td>
							<div tabIndex="0" className="button inputPlus noselect" onClick={this.addDeck}>
								<div>
									<div>Add</div>
								</div>
								<div className="hover">
									<div>Add</div>
								</div>
							</div>
						</td>
						<td colSpan={3} style={{textAlign: "center"}} >---</td>
					</tr>
				</thead>
				<tbody>
				{
					this.state.decks.map(o=>
						<Deck key={o.code5} name={o.name} code5={o.code5} nbrCalls={o.deck.calls.length} nbrRes={o.deck.res.length} multiplier={o.callMultiplier} />
					)
				}
				</tbody>
			</table>
	}
}
 
