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
	},
	post: async function(data) {
		let {score} = await data
		let {gameCode} = await data
		let [player1, player2] = Object.keys(score)

		try {
			await db.beginTransaction()
			await makeHistory(gameCode, player1)
			await makeHistory(gameCode, player2)
			
			let winner
			let loser
			let draw = []
	
			if(score[player1] > score[player2]) {
				winner = player1
				loser = player2
			} else if (score[player1] < score[player2]) {
				winner = player2
				loser = player1
			} else {
				draw.push(player1)
				draw.push(player2)
				updateDraw(gameCode, draw)
			}
	
			await updateScore(gameCode, winner, loser)
			db.commit()
		} catch (error) {
			db.rollback()
			return new Error(error)
		}
	}
};

//ID from users table
async function getUserId(nickname) {
	let sql = 'select id from users where nickname = ?'
	return await db.query(sql, nickname)
}

//get player's game history
async function getHistory(gameCode, nickname) {
	try {
		await db.beginTransaction()
		let userId = await getUserId(nickname)
		let sqlScoreId = `
		select id
		from users_game
		where userId = ?
		and gameCode = ?`
	
		let scoreId = await db.query(sqlScoreId, [userId, gameCode])

		let sqlHistory = `
			select *
			from playerScore
			where scoreId = ?`
	
		await db.commit()
		return await db.query(sqlHistory, scoreId)
	}	catch(error) {
		db.rollback()
		return new Error(error)
	}
}

//when a player played a game for the first time this function insert a row at users_game table and playerscore table
async function makeHistory(gameCode, nickname) {
	try {
		await db.beginTransaction()
		let userId = await getUserId(nickname)

		let sql = `
		insert into users_game (userId, gameCode)
		select ?, ?
		from dual
		where not exists(
			select * from users_game
			where userId = ?
			and gameCode = ?
		)`

		let row = await db.query(sql, [userId, gameCode])
		let scoreId = row.insertId
		if(row.affectedRows === 1) {
			let sql = `
			insert into playerscore (scoreId, gamesPlayed, gamesWon, gamesTied)
			values(?, ?, ?, ?)`
			db.query(sql, [scoreId, 0, 0 ,0])
		} 
		await db.commit()
	} catch(error) {
		await db.rollback()
		return new Error(error)
	}
}

//when a game finished update score for playerscore table
async function updateScore(gameCode, winner, loser) {
	try {
		await db.beginTransaction()
		let {winnerScoreId, winnerGamesPlayed, winnerGamesWon, winnerGamesTied} = await getHistory(gameCode, winner)
		let {loserScoreId, loserGamesPlayed, loserGamesWon, loserGamesTied} = await getHistory(gameCode, loser)

		let sql =`
		update playscore
		set gamesPlayed = ?,
				gamesWon = ?
				games Tied = ?
		where scoreId = ?
		`
		await db.query(sql, [winnerGamesPlayed + 1, winnerGamesWon + 1, winnerGamesTied, winnerScoreId])
		await db.query(sql, [loserGamesPlayed + 1, loserGamesWon, loserGamesTied, loserScoreId])
		await db.commit()
	} catch (error) {
		await db.rollback()
		return new Error(error)
	}
}

async function updateDraw(gameCode, players) {
	try {
		await db.beginTransaction()
		let {player1ScoreId, player1GamesPlayed, player1GamesTied} = await getHistory(gameCode, players[0])
		let {player2ScoreId, player2GamesPlayed, player2GamesTied} = await getHistory(gameCode, players[1])
		
		let sql =`
		update playscore
		set gamesPlayed = ?,
				games Tied = ?
		where scoreId = ?
		`

		await db.query(sql, [player1GamesPlayed + 1, player1GamesTied + 1, player1ScoreId])
		await db.query(sql, [player2GamesPlayed + 1, player2GamesTied + 1, player2ScoreId])
		await db.commit()
	} catch (error) {
		await db.rollback()
		return new Error(error)
	}

}
