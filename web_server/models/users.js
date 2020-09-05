const db = require('../db/config');
const asyncdb = db.promise();
const crypto = require('crypto');

module.exports = {
	signup : {
		post: async function(data) {
			let {userId, password, nickname} = await data;
			//password 암호화
			let key = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toString('hex');
			password = key;
	
			try {
				// userId가 db에 있는지 확인하여
				// db에 이미 존재하면 {result: 1}
				// db에 존재하지 않으면 {resutlt: 0}
				let userIdSql = `
					select exists(
						select userId
						from users
						where userId = ?
					) as result`;

				// nickname이 db에 있는지 확인하여
				// db에 이미 존재하면 {result: 1}
				// db에 존재하지 않으면 {resutlt: 0}
				let nicknameSql = `
					select exists(
						select nickname
						from users
						where nickname = ?
					) as result`;

				// userId와 nickname이 둘다 존재하지 않을 때 사용하는 query문
				// db에 새 user data 생성
				let signupSql = `
				insert into users (userId, nickname, password)
				values (?, ?, ?)`;

				let [id] = (await asyncdb.query(userIdSql, userId))[0];
				let [name] = (await asyncdb.query(nicknameSql, nickname))[0];

				if(id.result === 1) {
					// id가 db에 있을 시 {result : 1} userId 으로 throw
					throw 'userId';
				} else if(name.result === 1) {
					// nickname이 db에 있을 시 {result: 1} nickname으로 throw
					throw 'nickname';
				} else {
					asyncdb.query(signupSql, [userId, nickname, password]);
				}
			} catch(error) {
				// Error객체로 controller로 보냄
				throw Error(error);
			}
		}
	},
	signin: {
		post: async function(data) {
			let {userId, password, socialId, nickname} = await data;
			// let shasum = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toSting('hex');
			// password = shasum;
			if(!data.socialId) {	//소셜 로그인 아닌 경우
				let key = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toString('hex');
				password = key;
				return new Promise((resolve, reject) => {
					let sql = `
							select
								id,
								nickname,
								avatarId
							from users
							where userId = ? and password = ?`;
					db.query(sql, [userId, password], (error, result) => {
						if(!result.length) reject(new Error('loginErr'));
						// console.log(result);
						error ? reject(error) : resolve(result);
					});
				});
			} else {
				return new Promise((resolve, reject) => {
					let sql = `
							insert into users (userId, nickname, socialId)
							select ?, ?, ?
							from dual
							where not exists(
								select userId, socialId 
								from users where socialId = ? and userId = ?)`;
					db.query(sql, [userId, nickname, socialId, socialId, userId], (error) => {
						if(error) {return reject(error);}
						let sql = `
							select id, userId, nickname
							from users
							where userId = ? and socialId = ?`;
						db.query(sql, [userId, socialId], (error, result) => {
							error ? reject(error) : resolve(result);
						}); 
					});
				});
			}
		}
	}
};