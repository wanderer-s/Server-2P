var models = require('../models');

module.exports = {
	signup: {
		post: async function (req, res) {
			try {
				let params = [req.body.userid, req.body.password, req.body.nickname];
				await models.users.post(params);
				res.status(200).json({'message' : '회원가입 성공했습니다.'});
			} catch (err) {
				// console.error(err);
				res.status(409).json({'error' : '이미 존재하는 아이디/닉네임 입니다.'});
			}
		}
	}
};
