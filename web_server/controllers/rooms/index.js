const momnet = require('moment');

let moleRooms = {};
/*
{
	"roomId":,
	"gameCode":
	"password": 
	"roomName": 
	"roomOwner": 
}
*/
module.exports = {
	post: async function (req, res) {
		try {
			let params = {
				roomId: momnet().format('YYYYMMDDHHMMSS') + req.body.roomName,
				gameCode: req.body.gameCode,
				password: req.body.password,
				roomName: req.body.roomName,
				roomOwner: req.body.roomOwner
			};
			
			if(params.gameCode === 1){	//두더지 게임
				//Owner확인, 이미 생성된 방중 Owner가 겹치면 기존에 있던 방 삭제..?
				moleRooms[params.roomId] = params;
			}

			res.status(200).json({ 'message': '방을 성공적으로 생성했습니다.' });
			// console.log(moleRooms);
			//redirection?
		} catch (err) {
			console.error(err);
			res.status(501).json({ 'error': JSON.stringify(err) });
		}
	}
};
