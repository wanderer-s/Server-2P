const db = require('../db/config');
const crypto = require('crypto');

module.exports = {
	signup : {
		post: async function(data) {
			let {userId, password, nickName, socialId} = await data;
			//password 암호화
			let shasum = crypto.pbkdf2(password, '2p4P"sfinal_Project!', 942148, 'sha512').toSting('hex');
			password = shasum;
			
			//socialId가 없을때(자체 회원가입)
			if(!socialId) socialId = null;
	
			return new Promise((resolve, reject) => {
				let sql = `
					insert into users (userId, nickName, sociallid, password)
					values (?, ?, ?, ?)`;
				db.query(sql, [userId, nickName, socialId, password], (error, result) => {
					error? reject(error) : resolve(result);
				});
			});
		}
	}
};

