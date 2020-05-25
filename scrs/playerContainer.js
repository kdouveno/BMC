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

var PlayerContainer = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: {},
			me: "",
			show: 0
		}
		this.events = {
			me: (data) => {
				console.log("me: " + data);
				this.setState({
					me: data[0],
				});
				var href = window.location.href;
				console.log(href);
				
				if (href.includes("sessionToken")) {
					href = href.replace(/sessionToken=[\w-]*/, "sessionToken=" + data[1]);
				} else {
					if (href.includes("?"))
						href += "&";
					else
						href += "?";
					href += "sessionToken=" + data[1];
				}
				history.pushState({}, '', href);
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
		return Object.keys(this.state.players).map(o => {
			return <Player key={o} me={this.state.me == o} show={!!this.state.show} delay={this.state.show == 1 ? 1.5 + i++ * .2 : 0} gamedata={this.state.players[o]} />
		});
	}
}
 
