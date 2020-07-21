//express 서버
const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');

const userRouter = require('./routes/users');
const roomRouter = require('./routes/rooms');

const morgan = require('morgan');

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors());

app.use(
	cors({
		origin: ['http://localhost:3000'],
		methods: ['GET', 'POST', 'DELETE'],
		credentials: true
	})
);

app.use(
	session({
		secret: '@codestates',
		resave: false,
		saveUninitialized: true
	})
);

app.use(morgan('dev'));

//라우터
app.use('/users', userRouter);
app.use('/rooms', roomRouter);

app.set('port', port);
app.listen(app.get('port'), () => {
	console.log(`app is listening in PORT ${app.get('port')}`);
});

app.get('/', (req, res) => {
	res.status(200).send('Success');
});