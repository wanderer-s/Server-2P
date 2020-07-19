const express = require('express');
const router = express.Router();

const { roomController } = require('../controllers');

router.post('/makeroom', roomController.makeroom.post);
router.get('/roomlist', roomController.roomlist.get);

module.exports = router;
