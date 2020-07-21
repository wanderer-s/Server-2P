const db = require('../db/config');

module.exports = {
	get: async function(data) {

		return new Promise((resolve, reject) => {
			
			let sql=`
				select
					gl.gameName,
					p.gamesPlayed,
					p.gamesWon,
					p.gamesTied,
					p.gamesPlayed - p.gamesWon - p.gamesTied as gamesLost
				from users_game ug
				join gameList gl on gl.code = ug.gameCode
				join playerscore p on p.scoreId = ug.id
				where ug.userId = ?
				order by gl.gameName
				`;
				
			db.query(sql, data, (error1, result1) => {
				if(error1) {
					reject(error1);
				} else {
					let sql =`
							select nickname, avatarId
							from users
							where id = ?`;
					db.query(sql, data, (error2, result2) => {
						if(error2) {
							reject(error2);
						} else {
							if(result1.length === 0) {
								resolve(result2);
							} else {
								for(let row of result1) {
									result2[0][row.gameName] = {
										play : row.gamesPlayed,
										win : row.gamesWon,
										tie : row.gamesTied,
										lose : row.gamesLost
									};
								}
								resolve(result2);
							}
						}
					});
				}
			});
		});
	},
	put: async function(data) {
		let {userId, avatarId} = await data;
		
		return new Promise((resolve, reject) => {
			let sql = `
					update users
					set avatarId = ?
					where id = ?
					`;
			db.query(sql, [avatarId, userId], (error, result) => {
				error? reject(error) : resolve(result);
			});
		});
	}
};