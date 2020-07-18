var models = require('../../models/users');

module.exports = {
	post: async function (req, res) {
		try {
			let params = {
				userId: req.body.userId,
				password: req.body.password,
				nickname: req.body.nickname
			};
			await models.signup.post(params);
			res.status(200).json({ 'message': '회원가입 성공했습니다.' });
		} catch (err) {
			console.error(err);
			res.status(409).json({ 'error': JSON.stringify(err) });
		}
	}
};
