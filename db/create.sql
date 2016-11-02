-- --------------------------------------------------------
-- 主机:                           127.0.0.1
-- 服务器版本:                        5.6.21-log - MySQL Community Server (GPL)
-- 服务器操作系统:                      Win64
-- HeidiSQL 版本:                  9.1.0.4867
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE  IF NOT EXISTS `badjs` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `badjs`;

-- 导出  表 betterjs.b_statistics 结构
DROP TABLE IF EXISTS `b_statistics`;
CREATE TABLE IF NOT EXISTS `b_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectId` int(11) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `content` longtext COLLATE utf8_unicode_ci,
  `total` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


--
-- Table structure for table `b_apply`
--

DROP TABLE IF EXISTS `b_apply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `b_apply` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `status` int(11) NOT NULL,
  `name` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `appkey` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `url` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `blacklist` text COLLATE utf8_unicode_ci ,
  `description` text COLLATE utf8_unicode_ci,
  `mail` varchar(80) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `passTime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `b_approve`
--

DROP TABLE IF EXISTS `b_approve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `b_approve` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(20) COLLATE utf8_unicode_ci NOT NULL,
  `reply` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `applyId` int(11) NOT NULL,
  `createTime` timestamp NULL DEFAULT NULL,
  `applyStatus` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `applyId` (`applyId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `b_user`
--

DROP TABLE IF EXISTS `b_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `b_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loginName` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `chineseName` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `role` int(11) NOT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


--
/*!40000 ALTER TABLE `b_user` DISABLE KEYS */;
INSERT INTO `b_user` (`id`, `loginName`, `chineseName`, `role`, `email`, `password`) VALUES
	(1, 'admin', 'admin', 1, NULL, '21232f297a57a5a743894a0e4a801fc3');



--
-- Table structure for table `b_user_apply`
--

DROP TABLE IF EXISTS `b_user_apply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `b_user_apply` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `applyId` int(11) NOT NULL,
  `role` int(1) NOT NULL DEFAULT '0',
  `createTime` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applyId_idx` (`applyId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;


-- Dump completed on 2015-01-20  9:43:38


