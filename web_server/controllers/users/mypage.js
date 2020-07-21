let mypage = require('../../models/mypage');

module.exports = {
	get: async function (req, res) {
		try {
			let {userId} = await req.session;

			let data = await mypage.get(userId);
			console.log(data);
			res.status(200).json(data[0]);

		} catch(error) {
			console.error(error);
			res.status(401).json({error:'다시 로그인해주세요'});
		}
	},
	put: async function (req, res) {
		try {
			let {userId} = await req.session;
			let {avatarId} = await req.body;

			let param = {
				userId,
				avatarId
			};
			console.log(param);

			await mypage.put(param);
			res.status(200).json({message: '성공적으로 변경되었습니다'});
		} catch(error) {
			console.error(error);
			res.status(401).json({error: '다시 로그인해주세요'});
		}
	}
};