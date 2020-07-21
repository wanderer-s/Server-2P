const db = require('../db/config');

module.exports = {
	get: async function(data) {

		return new Promise((resolve, reject) => {
			
			let sql=`
				select 
					gl.gameName,
					ug.gamesPlayed,
					ug.gamesWon,
					ug.gamesTied,
					ug.gamesPlayed - gamesWon - gamesTied as gameLose
				from users_game ug
				join gameList gl on gl.code = ug.gameCode
				where ug.userId = ?
				order by gl.gameName
				`;
			db.query(sql, data, (error, result) => {
				if(error) {
					reject(error);
				} else {
					console.log(JSON.stringify(result));
					let sql =`
							select nickname, avatarId
							from users
							where id = ?`;
					db.query(sql, data, (error, result) => {
						if(error) {
							reject(error);
						} else {
							console.log(result);
						}
					});
				}
			});
		});
	},
	put: async function(data) {
		let {sessionKey, avatarId} = data;

		return new Promise((resolve, reject) => {
			let sql = `
					update users
					set avatarId = ?
					where id = ?
					`;
			db.query(sql, [avatarId, sessionKey], (error, result) => {
				error? reject(error) : resolve(result);
			});
		});
	}
};