var Player = function(props)
{
	return (
		<div className={"user" + (props.show ? " shown" : "")} style={{"--pc": "#" + props.gamedata.info.color, "--delay" : props.delay + "s"}}>
			<div className="hover"></div>
			<div>
				<h3>{props.gamedata.info.displayName}</h3>
				<h5>{props.gamedata.status}</h5>
			</div>
			<div><h1>{props.gamedata.points}</h1></div>
		</div>
	);
}

var ExternPlayersState;

var PlayerContainer = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: {},
			me: "",
			show: 0
		}
		ExternPlayersState = this.state;
		this.events = {
			me: (data) => {
				console.log("me: " + data);
				this.state.me = data[0];
				this.setState(this.state);
				// u.href.append("sessionToken", data[1]);
			},
			updatePlayers: (data) => {
				console.log(data);
				_.merge(this.state.players, data);
				this.state.show++ & 3;
				this.setState(this.state);

				console.log(this.state.players, this.state.me, this.state.players[this.state.me]);
				
				ui.updateAdminRight(this.state.players[this.state.me].role == "admin");
			}
		}
	}

	componentDidMount() {
		u.registerEvents(socket, this.events);
	}
	componentWillUnmount() {
		u.unregisterEvents(socket, this.events);
	}
	render() { 
		var i = 0;
		return <div id="usersContainer">
				<div id="playersContainer" >
					<div className="title">
						<h2>Players</h2>
					</div>
					<div id="playerList">
					{
						Object.keys(this.state.players).filter(o=>this.state.players[o].status !== "spectator").map(o => {
							return <Player key={o} me={this.state.me == o} show={!!this.state.show} delay={this.state.show == 1 ? 1.5 + i++ * .2 : 0} gamedata={this.state.players[o]} />
						})
					}
					</div>
				</div>
				<div id="spectatorsContainer">
					<div className="title">
						<h2>Spectators</h2>
					</div>
					<div id="spectatorList">
					{
						Object.keys(this.state.players).filter(o=>this.state.players[o].status === "spectator").map(o => {
							return <Player key={o} me={this.state.me == o} show={!!this.state.show} delay={this.state.show == 1 ? 1.5 + i++ * .2 : 0} gamedata={this.state.players[o]} />
						})
					}
					</div>
				</div>;
			</div>
		return 
	}
}
 
