module.exports = {
	kick: function(s, msg){
		s.emit("kickedOut", {id: s.nsp.name, msg: msg}).disconnect();
	}
}
