-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.5.2-MariaDB-log - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for website-sekolah
CREATE DATABASE IF NOT EXISTS `website-sekolah` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `website-sekolah`;

-- Dumping structure for table website-sekolah.comments
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL,
  `content` text DEFAULT NULL,
  `author` varchar(64) DEFAULT NULL,
  `upvote` int DEFAULT NULL,
  `downvote` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table website-sekolah.media
CREATE TABLE IF NOT EXISTS `media` (
  `UUID` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 NOT NULL CHECK (json_valid(`tags`)),
  `path` longtext CHARACTER SET utf8mb4 NOT NULL CHECK (json_valid(`path`)),
  PRIMARY KEY (`UUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table website-sekolah.quotes
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` int NOT NULL,
  `content` text DEFAULT NULL,
  `author` varchar(64) DEFAULT NULL,
  `upvote` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table website-sekolah.students
CREATE TABLE IF NOT EXISTS `students` (
  `nis` int(10) NOT NULL,
  `name` varchar(64) DEFAULT NULL,
  `gender` enum('♂','♀') DEFAULT NULL,
  `birthplace` varchar(64) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `religion` varchar(64) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `major` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `father` varchar(64) DEFAULT NULL,
  `mother` varchar(64) DEFAULT NULL,
  `father_job` varchar(50) DEFAULT NULL,
  `mother_job` varchar(50) DEFAULT NULL,
  `previous_school` varchar(50) DEFAULT NULL,
  `photo` int DEFAULT NULL,
  PRIMARY KEY (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table website-sekolah.teachers
CREATE TABLE IF NOT EXISTS `teachers` (
  `nip` int(18) NOT NULL,
  `name` varchar(64) DEFAULT NULL,
  `gender` enum('♂','♀') DEFAULT NULL,
  `birthplace` varchar(64) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `religion` varchar(64) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `highest_education` varchar(50) DEFAULT NULL,
  `photo` int DEFAULT NULL,
  PRIMARY KEY (`nip`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table website-sekolah.users
CREATE TABLE IF NOT EXISTS `users` (
  `email` varchar(255) NOT NULL,
  `password` varchar(60) NOT NULL DEFAULT '',
  `nickname` varchar(64) NOT NULL,
  `comments` longtext CHARACTER SET utf8mb4 DEFAULT NULL CHECK (json_valid(`comments`)),
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

-- Dumping structure for table website-sekolah.webposts
CREATE TABLE IF NOT EXISTS `webposts` (
  `id` int NOT NULL DEFAULT 0,
  `title` varchar(255) DEFAULT NULL,
  `author` varchar(64) DEFAULT NULL,
  `date` timestamp NULL DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 DEFAULT NULL CHECK (json_valid(`tags`)),
  `views` int DEFAULT NULL,
  `upvote` int DEFAULT NULL,
  `downvote` int DEFAULT NULL,
  `comments` longtext CHARACTER SET utf8mb4 DEFAULT NULL CHECK (json_valid(`comments`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
