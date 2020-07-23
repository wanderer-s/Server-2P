const momnet = require('moment');

let moleRooms = {};
/*
{
	"roomId":,
	"gameCode":
	"password": 
	"roomName": 
  "roomOwner": 
  "userNum":
}
*/
module.exports = {
	makeroom: {
		post: async function (req, res) {
			try {
				let params = {
					roomId: momnet().format('YYYYMMDDHHMMSS') + '-' +  req.body.roomName,
					gameCode: req.body.gameCode,
					password: req.body.password,
					roomName: req.body.roomName,
					roomOwner: req.session.username,  
					userNum: 1
				};
				
				if(params.gameCode === 1){	//두더지 게임
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
		get: function(req, res) {
			try{
				let gameCode = req.query.gameCode;
				// console.log(gameCode);

				if(gameCode === '1'){
					let rooms = [];

					Object.keys(moleRooms).forEach(k => {
						let room = {};
						room.roomId = moleRooms[k].roomId;
						room.gameCode = moleRooms[k].gameCode;
						room.roomName = moleRooms[k].roomName;
						room.roomOwner = moleRooms[k].roomOwner;
						room.userNum = moleRooms[k].userNum;
						room.isLock = Boolean(moleRooms[k].password);
						rooms.push(room);
					});

					// res.status(200).json(moleRooms);  //변경 필요
					res.status(200).json(rooms);  
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
						moleRooms[roomId].userNum += 1;
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
	},
	leaveroom: {
		post: function(req, res){
			try{
				let roomId = req.body.roomId;
				let nickname = req.body.username;
				let gameCode = req.body.gameCode;
				
				if(gameCode === 1){
					if(moleRooms[roomId].roomOwner === nickname){
						delete moleRooms[roomId];
						res.status(200).json({'message': '방장이 방을 끝냈습니다'});
					} else {
						moleRooms[roomId].userNum -=1;
						res.status(200).json({'message': '한 명이 방을 나갔습니다'});
					}
				}
			} catch (err) {
				console.log(err);
				res.status(501).json({ 'error': JSON.stringify(err) });
			}
		}
	},
};
