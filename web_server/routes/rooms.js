const express = require('express');
const router = express.Router();

const { roomController } = require('../controllers');

router.post('/makeroom', roomController.makeroom.post);

module.exports = router;
