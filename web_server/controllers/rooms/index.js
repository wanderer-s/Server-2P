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
	makeroom: {
		post: async function (req, res) {
			try {
				let params = {
					roomId: momnet().format('YYYYMMDDHHMMSS') + req.body.roomName,
					gameCode: req.body.gameCode,
					password: req.body.password,
					roomName: req.body.roomName,
					roomOwner: req.body.roomOwner
				};

				if (params.gameCode === 1) {	//두더지 게임
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
	},
	roomlist: {
		get: function (req, res) {
			try {
				let gameCode = req.query.gameCode;
				// console.log(gameCode);

				if (gameCode === '1') {
					let roomArr = [];
					Object.keys(moleRooms).map(key => {
						let value = {};
						value.roomId = moleRooms[key].roomId;
						value.gameCode = moleRooms[key].gameCode;
						value.roomName = moleRooms[key].roomName;
						value.roomOwner = moleRooms[key].roomOwner;
						roomArr.push(value);
					});

					res.status(200).json(roomArr);
				}
			} catch (err) {
				console.log(err);
				res.status(501).json({ 'error': JSON.stringify(err) });
			}
		}
	},
	joinroom: {
		post: function(req, res){
			try{
				let roomId = req.query.roomId;
				// console.log(gameCode);
				let gameCode = req.body.gameCode;
				let password = req.body.password;
				
				if(gameCode === 1){
					if(moleRooms[roomId].password === password){
						res.status(200).json({'message': '방 입장에 성공했습니다'});
					}else{
						res.status(409).json({'error': '비밀번호가 틀렸습니다'});
					}
				}
			} catch (err) {
				console.log(err);
				res.status(501).json({ 'error': JSON.stringify(err) });
			}
		}
	}
};
