const db = require('../db/config');
const crypto = require('crypto');

module.exports = {
	signup : {
		post: async function(data) {
			let {userId, password, nickname} = await data;
			//password 암호화
			let key = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toString('hex');
			password = key;
	
			return new Promise((resolve, reject) => {
				let sql = `
						select not exists(
							select userId
							from users
							where userId = ?
						) as result`;
				db.query(sql, userId, (error, result) => {
					if(result[0].result !== 1) {
						return reject(new Error('userId'));
					} else {
						let sql = `
						select not exists(
							select nickname
							from users
							where nickname = ?
						) as result`;
						db.query(sql, nickname, (error, result) => {
							if(result[0]['result'] !== 1) {
								return reject(new Error('nickname'));
							} else {
								let sql = `
										insert into users (userId, nickname, password)
										values (?, ?, ?)`;
								db.query(sql, [userId, nickname, password], (error, result) => {
									error? reject(error) : resolve(result);
								});
							}
						});
					}	
				});
			});
		}
	}
};

