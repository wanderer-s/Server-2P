CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `userId` varchar(40) UNIQUE,
  `nickName` varchar(15) UNIQUE,
  `socialId` varchar(20),
  `avatarId` int,
  `password` varchar(30)
);

CREATE TABLE `gameList` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `gameName` varchar(20)
);

CREATE TABLE `users_game` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `gameId` int NOT Null,
  foreign key(`gameId`) references `gameList`(`id`)
  on delete cascade,
  `userId` int NOT Null,
  foreign key(`userId`) references `users`(`id`)
  on delete cascade
);

CREATE TABLE `playerScore` (
  `scoreId` int not null,
  foreign key(`scoreId`) references `users_game`(`id`)
  on delete cascade,
  `gamesPlayed` int,
  `gamesWon` int,
  `gamesTied` int
);