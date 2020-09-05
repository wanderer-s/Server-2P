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
			let key = crypto.pbkdf2Sync(password, '2p4P"sfinal_Project!', 942148, 64, 'sha512').toString('hex');
			password = key;
			try {
				if(!data.socialId) {
					//socialId가 없을 시 즉 social login이 아닌 자체 login일 시
					let loginSql = `
							select
								id,
								nickname,
								avatarId
							from users
							where userId = ? and password = ?`;
					
					let [login] = (await asyncdb.query(loginSql, [userId, password]))[0];
					if(!login) {
						//loginSql 로 db 추출시에 값이 없는경우
						//즉 회원가입을 하지 않았거나 Id 혹은 password가 틀린경우
						throw 'loginErr'; //loginErr 로 throw
					} return login; // controller로 login 전송 data는 중요하지 않고 이 함수가 끝나는게 중요
				} else { //socialId가 있을 때 (social Login 시도할 때)
					// 값이 있으면 아무 변화가 없고
					// 값이 없으면 insert 하는 query 문
					let insertSocialUser = `
							insert into users
							(userId, nickname, socialId)
							select ?, ?, ?
							from dual
							where not exists(
								select userId, socialId 
								from users where socialId = ? and userId = ?)`;
					await asyncdb.query(insertSocialUser, [userId, nickname, socialId, socialId, userId]);
					//db에 해당 userId와 socialId가 있으면 변화 X,
					//없으면 해당 data 생성
		
					let loginSocialUser = `
							select id, userId, nickname
							from users
							where userId = ? and socialId = ?`;
					let [socialLogin] = (await asyncdb.query(loginSocialUser, [userId, socialId]))[0];
					if(!socialLogin) {
						//userId와 socialId로 select
						//추출이 안되면 loginErr throw(socialId라 그런경우가 없겠지만 만일에 대비하여)
						throw 'loginErr';
					}
					return socialLogin;
				}
			} catch(error) {
				throw Error(error);
			}
		}
	}
};