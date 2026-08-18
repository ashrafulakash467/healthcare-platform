-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Aug 11, 2026 at 11:31 AM
-- Server version: 11.4.9-MariaDB
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `healthcare_platform`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `appointment_no` varchar(100) NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `appointment_slot_id` bigint(20) UNSIGNED DEFAULT NULL,
  `consultation_type` varchar(100) NOT NULL DEFAULT 'in_person',
  `appointment_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'pending',
  `payment_status` varchar(100) NOT NULL DEFAULT 'unpaid',
  `channel` varchar(100) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `symptoms` text DEFAULT NULL,
  `doctor_notes` text DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `accepted_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `rescheduled_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointments_appointment_no_unique` (`appointment_no`),
  KEY `appointments_hospital_id_foreign` (`hospital_id`),
  KEY `appointments_appointment_slot_id_foreign` (`appointment_slot_id`),
  KEY `apt_doc_date_status_idx` (`doctor_id`,`appointment_date`,`status`),
  KEY `apt_patient_date_status_idx` (`patient_id`,`appointment_date`,`status`),
  KEY `appointments_consultation_type_index` (`consultation_type`),
  KEY `appointments_appointment_date_index` (`appointment_date`),
  KEY `appointments_status_index` (`status`),
  KEY `appointments_payment_status_index` (`payment_status`),
  KEY `appointments_channel_index` (`channel`),
  KEY `appointments_follow_up_date_index` (`follow_up_date`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `appointment_no`, `patient_id`, `doctor_id`, `hospital_id`, `appointment_slot_id`, `consultation_type`, `appointment_date`, `start_time`, `end_time`, `status`, `payment_status`, `channel`, `reason`, `symptoms`, `doctor_notes`, `cancel_reason`, `accepted_at`, `rejected_at`, `rescheduled_at`, `started_at`, `completed_at`, `follow_up_date`, `meta`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'APT-1001', 1, 1, 1, 2, 'in_person', '2026-08-03', '09:30:00', '10:00:00', 'pending', 'pending', 'web', 'General consultation', 'Follow-up visit', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"seeded\":true}', '2026-08-02 01:12:41', '2026-08-02 01:12:41', NULL),
(2, 'APT-1002', 1, 1, 1, 9, 'in_person', '2026-08-04', '11:00:00', '11:30:00', 'confirmed', 'paid', 'web', 'General consultation', 'Follow-up visit', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"seeded\":true}', '2026-08-02 01:12:41', '2026-08-02 01:12:41', NULL),
(3, 'APT-1003', 1, 1, 1, 20, 'in_person', '2026-08-06', '16:00:00', '16:30:00', 'upcoming', 'unpaid', 'web', 'General consultation', 'Follow-up visit', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"seeded\":true}', '2026-08-02 01:12:41', '2026-08-02 01:12:41', NULL),
(4, 'APT-20260804104126-ZQST', 3, 4, NULL, 36, 'in_person', '2026-08-05', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-04 04:41:26', '2026-08-04 04:41:26', NULL),
(5, 'APT-20260804104247-IVIT', 3, 4, NULL, 45, 'in_person', '2026-08-26', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-04 04:42:47', '2026-08-04 04:42:47', NULL),
(6, 'APT-20260804104402-XCTO', 3, 4, NULL, 50, 'in_person', '2026-09-09', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-04 04:44:02', '2026-08-04 04:44:02', NULL),
(7, 'APT-20260804104741-4DOQ', 3, 4, NULL, 49, 'in_person', '2026-09-07', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-04 04:47:41', '2026-08-04 04:47:41', NULL),
(8, 'APT-20260804104819-OTJH', 3, 4, NULL, 53, 'in_person', '2026-09-16', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-04 04:48:19', '2026-08-04 04:48:19', NULL),
(9, 'APT-20260804105601-EOS5', 4, 4, NULL, 51, 'in_person', '2026-09-12', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-04 04:56:01', '2026-08-04 04:56:01', NULL),
(10, 'APT-20260804110948-4LUG', 4, 1, NULL, 16, 'in_person', '2026-08-06', '09:00:00', '09:30:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, '2026-08-04 05:13:53', NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"House 12, Road 5, Dhanmondi, Dhaka\"}', '2026-08-04 05:09:48', '2026-08-04 05:13:53', NULL),
(11, 'APT-20260804120251-7SR3', 4, 3, NULL, 69, 'in_person', '2026-08-06', '10:00:00', '11:00:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, '2026-08-04 06:06:31', NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Mental Hospital\"}', '2026-08-04 06:02:51', '2026-08-04 06:06:31', NULL),
(12, 'APT-20260805060618-FXIE', 3, 4, NULL, 37, 'in_person', '2026-08-08', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-05 00:06:18', '2026-08-05 00:06:18', NULL),
(13, 'APT-20260809091829-BI20', 5, 4, NULL, 38, 'in_person', '2026-08-10', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-09 03:18:29', '2026-08-09 03:18:29', NULL),
(14, 'APT-20260811062024-I08L', 6, 4, NULL, 39, 'in_person', '2026-08-12', '09:00:00', '09:15:00', 'pending', 'pending', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Cardio Care Cardiology.\"}', '2026-08-11 00:20:24', '2026-08-11 00:20:24', NULL),
(15, 'APT-20260811070103-BOCO', 7, 3, NULL, 75, 'in_person', '2026-08-12', '10:00:00', '11:00:00', 'pending', 'paid', 'web', 'General consultation', NULL, NULL, NULL, NULL, NULL, '2026-08-11 01:35:12', NULL, NULL, NULL, '{\"source\":\"web\",\"clinic_address\":\"Mental Hospital\"}', '2026-08-11 01:01:03', '2026-08-11 01:35:24', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `appointment_slots`
--

DROP TABLE IF EXISTS `appointment_slots`;
CREATE TABLE IF NOT EXISTS `appointment_slots` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_schedule_id` bigint(20) UNSIGNED NOT NULL,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `slot_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `capacity` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `booked_count` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `is_bookable` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(100) NOT NULL DEFAULT 'available',
  `generated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aps_schedule_date_start_unique` (`doctor_schedule_id`,`slot_date`,`start_time`),
  KEY `appointment_slots_doctor_id_foreign` (`doctor_id`),
  KEY `appointment_slots_hospital_id_foreign` (`hospital_id`),
  KEY `appointment_slots_slot_date_index` (`slot_date`),
  KEY `appointment_slots_is_bookable_index` (`is_bookable`),
  KEY `appointment_slots_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=144 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointment_slots`
--

INSERT INTO `appointment_slots` (`id`, `doctor_schedule_id`, `doctor_id`, `hospital_id`, `slot_date`, `start_time`, `end_time`, `capacity`, `booked_count`, `is_bookable`, `status`, `generated_at`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 1, '2026-08-03', '09:30:00', '10:00:00', 1, 1, 0, 'booked', '2026-08-02 01:12:40', '2026-08-02 01:12:40', '2026-08-04 05:09:30'),
(6, 1, 1, 1, '2026-08-04', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-02 01:12:40', '2026-08-09 05:09:31'),
(8, 1, 1, 1, '2026-08-04', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-02 01:12:40', '2026-08-09 05:09:31'),
(9, 1, 1, 1, '2026-08-04', '11:00:00', '11:30:00', 1, 1, 0, 'booked', '2026-08-02 01:12:40', '2026-08-02 01:12:40', '2026-08-04 05:09:30'),
(16, 1, 1, 1, '2026-08-06', '09:00:00', '09:30:00', 1, 1, 0, 'booked', '2026-08-09 05:09:31', '2026-08-02 01:12:40', '2026-08-09 05:09:31'),
(18, 1, 1, 1, '2026-08-06', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-02 01:12:40', '2026-08-09 05:09:31'),
(20, 1, 1, 1, '2026-08-06', '16:00:00', '16:30:00', 1, 1, 0, 'booked', '2026-08-02 01:12:40', '2026-08-02 01:12:40', '2026-08-04 05:09:30'),
(143, 3, 2, NULL, '2026-08-29', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(142, 3, 2, NULL, '2026-08-27', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(141, 3, 2, NULL, '2026-08-25', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(140, 3, 2, NULL, '2026-08-22', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(26, 1, 1, 1, '2026-08-08', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-02 01:12:41', '2026-08-09 05:09:31'),
(139, 3, 2, NULL, '2026-08-20', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(28, 1, 1, 1, '2026-08-08', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-02 01:12:41', '2026-08-09 05:09:31'),
(138, 3, 2, NULL, '2026-08-18', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(137, 3, 2, NULL, '2026-08-15', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(136, 3, 2, NULL, '2026-08-13', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(135, 3, 2, NULL, '2026-08-11', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(134, 3, 2, NULL, '2026-08-08', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(133, 3, 2, NULL, '2026-08-06', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(132, 3, 2, NULL, '2026-08-04', '10:00:00', '10:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-09 04:35:36', '2026-08-09 05:09:22'),
(36, 2, 4, NULL, '2026-08-05', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(37, 2, 4, NULL, '2026-08-08', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(38, 2, 4, NULL, '2026-08-10', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(39, 2, 4, NULL, '2026-08-12', '09:00:00', '09:15:00', 1, 1, 1, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-11 00:20:24'),
(40, 2, 4, NULL, '2026-08-15', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(41, 2, 4, NULL, '2026-08-18', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(42, 2, 4, NULL, '2026-08-20', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(43, 2, 4, NULL, '2026-08-22', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(44, 2, 4, NULL, '2026-08-24', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(45, 2, 4, NULL, '2026-08-26', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(46, 2, 4, NULL, '2026-08-29', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(47, 2, 4, NULL, '2026-09-02', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(48, 2, 4, NULL, '2026-09-05', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(49, 2, 4, NULL, '2026-09-07', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(50, 2, 4, NULL, '2026-09-09', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(51, 2, 4, NULL, '2026-09-12', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(52, 2, 4, NULL, '2026-09-14', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(53, 2, 4, NULL, '2026-09-16', '09:00:00', '09:15:00', 1, 1, 0, 'booked', '2026-08-09 05:21:11', '2026-08-04 04:39:33', '2026-08-09 05:21:11'),
(54, 3, 2, NULL, '2026-08-04', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(55, 3, 2, NULL, '2026-08-06', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(56, 3, 2, NULL, '2026-08-08', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(57, 3, 2, NULL, '2026-08-11', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(58, 3, 2, NULL, '2026-08-13', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(59, 3, 2, NULL, '2026-08-15', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(60, 3, 2, NULL, '2026-08-18', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(61, 3, 2, NULL, '2026-08-20', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(62, 3, 2, NULL, '2026-08-22', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(63, 3, 2, NULL, '2026-08-25', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(64, 3, 2, NULL, '2026-08-27', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(65, 3, 2, NULL, '2026-08-29', '09:00:00', '09:15:00', 1, 0, 1, 'available', '2026-08-09 05:09:22', '2026-08-04 04:39:43', '2026-08-09 05:09:22'),
(66, 4, 3, NULL, '2026-08-04', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(67, 4, 3, NULL, '2026-08-04', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(68, 4, 3, NULL, '2026-08-06', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(69, 4, 3, NULL, '2026-08-06', '10:00:00', '11:00:00', 1, 1, 0, 'booked', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(70, 4, 3, NULL, '2026-08-08', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(71, 4, 3, NULL, '2026-08-08', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(72, 4, 3, NULL, '2026-08-10', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(73, 4, 3, NULL, '2026-08-10', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(74, 4, 3, NULL, '2026-08-12', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-11 01:35:12'),
(75, 4, 3, NULL, '2026-08-12', '10:00:00', '11:00:00', 1, 1, 1, 'booked', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-11 01:35:12'),
(76, 4, 3, NULL, '2026-08-15', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(77, 4, 3, NULL, '2026-08-15', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(78, 4, 3, NULL, '2026-08-19', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(79, 4, 3, NULL, '2026-08-19', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(80, 4, 3, NULL, '2026-08-22', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(81, 4, 3, NULL, '2026-08-22', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(82, 4, 3, NULL, '2026-08-24', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(83, 4, 3, NULL, '2026-08-24', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(84, 4, 3, NULL, '2026-08-26', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(85, 4, 3, NULL, '2026-08-26', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(86, 4, 3, NULL, '2026-08-29', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(87, 4, 3, NULL, '2026-08-29', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(88, 4, 3, NULL, '2026-09-01', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(89, 4, 3, NULL, '2026-09-01', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(90, 4, 3, NULL, '2026-09-03', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(91, 4, 3, NULL, '2026-09-03', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(92, 4, 3, NULL, '2026-09-05', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(93, 4, 3, NULL, '2026-09-05', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(94, 4, 3, NULL, '2026-09-08', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(95, 4, 3, NULL, '2026-09-08', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(96, 4, 3, NULL, '2026-09-10', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(97, 4, 3, NULL, '2026-09-10', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(98, 4, 3, NULL, '2026-09-12', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(99, 4, 3, NULL, '2026-09-12', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(100, 4, 3, NULL, '2026-09-15', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(101, 4, 3, NULL, '2026-09-15', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(102, 4, 3, NULL, '2026-09-17', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(103, 4, 3, NULL, '2026-09-17', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(104, 4, 3, NULL, '2026-09-19', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(105, 4, 3, NULL, '2026-09-19', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(106, 4, 3, NULL, '2026-09-22', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(107, 4, 3, NULL, '2026-09-22', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(108, 4, 3, NULL, '2026-09-24', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(109, 4, 3, NULL, '2026-09-24', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(110, 4, 3, NULL, '2026-09-26', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(111, 4, 3, NULL, '2026-09-26', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(112, 4, 3, NULL, '2026-09-29', '09:00:00', '10:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(113, 4, 3, NULL, '2026-09-29', '10:00:00', '11:00:00', 1, 0, 1, 'available', '2026-08-09 05:07:55', '2026-08-04 04:39:43', '2026-08-09 05:07:55'),
(114, 1, 1, 1, '2026-08-11', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(115, 1, 1, 1, '2026-08-11', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(116, 1, 1, 1, '2026-08-13', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(117, 1, 1, 1, '2026-08-13', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(118, 1, 1, 1, '2026-08-15', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(119, 1, 1, 1, '2026-08-15', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(120, 1, 1, 1, '2026-08-18', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(121, 1, 1, 1, '2026-08-18', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(122, 1, 1, 1, '2026-08-20', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(123, 1, 1, 1, '2026-08-20', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(124, 1, 1, 1, '2026-08-22', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(125, 1, 1, 1, '2026-08-22', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(126, 1, 1, 1, '2026-08-25', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(127, 1, 1, 1, '2026-08-25', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(128, 1, 1, 1, '2026-08-27', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(129, 1, 1, 1, '2026-08-27', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(130, 1, 1, 1, '2026-08-29', '09:00:00', '09:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31'),
(131, 1, 1, 1, '2026-08-29', '10:00:00', '10:30:00', 1, 0, 1, 'available', '2026-08-09 05:09:31', '2026-08-04 05:09:30', '2026-08-09 05:09:31');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `auditable_type` varchar(100) DEFAULT NULL,
  `auditable_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `status_code` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_foreign` (`user_id`),
  KEY `audit_type_id_idx` (`auditable_type`,`auditable_id`),
  KEY `audit_logs_action_index` (`action`),
  KEY `audit_logs_auditable_type_index` (`auditable_type`),
  KEY `audit_logs_auditable_id_index` (`auditable_id`),
  KEY `audit_logs_ip_address_index` (`ip_address`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:18:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:18:\"access-admin-panel\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:19:\"access-doctor-panel\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:20:\"access-patient-panel\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:4;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:21:\"access-hospital-panel\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:5;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:12:\"manage-users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:14:\"manage-doctors\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:5;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:16:\"manage-hospitals\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:19:\"manage-appointments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:15:\"manage-payments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:5;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:14:\"manage-content\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:14:\"manage-reports\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:5;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:20:\"manage-notifications\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:14:\"manage-support\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:12:\"manage-roles\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:15:\"manage-settings\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:15:\"view-audit-logs\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:13:\"view-earnings\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:15:\"manage-schedule\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}}s:5:\"roles\";a:5:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:11:\"super-admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:5:\"admin\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:6:\"doctor\";s:1:\"c\";s:3:\"web\";}i:3;a:3:{s:1:\"a\";i:4;s:1:\"b\";s:7:\"patient\";s:1:\"c\";s:3:\"web\";}i:4;a:3:{s:1:\"a\";i:5;s:1:\"b\";s:8:\"hospital\";s:1:\"c\";s:3:\"web\";}}}', 1786441752);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) NOT NULL,
  `owner` varchar(100) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cms_pages`
--

DROP TABLE IF EXISTS `cms_pages`;
CREATE TABLE IF NOT EXISTS `cms_pages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `title` varchar(100) NOT NULL,
  `seo_title` varchar(100) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `template` varchar(100) NOT NULL DEFAULT 'default',
  `content` longtext DEFAULT NULL,
  `excerpt` text DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cms_pages_slug_unique` (`slug`),
  KEY `cms_pages_created_by_user_id_foreign` (`created_by_user_id`),
  KEY `cms_pages_updated_by_user_id_foreign` (`updated_by_user_id`),
  KEY `cms_pages_template_index` (`template`),
  KEY `cms_pages_status_index` (`status`),
  KEY `cms_pages_published_at_index` (`published_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `primary_hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `license_no` varchar(100) DEFAULT NULL,
  `specialty` varchar(100) NOT NULL,
  `sub_specialty` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `consultation_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `follow_up_fee` decimal(12,2) DEFAULT NULL,
  `image_path` varchar(100) DEFAULT NULL,
  `chamber_address` varchar(100) DEFAULT NULL,
  `available_dates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`available_dates`)),
  `available_time_slots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`available_time_slots`)),
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `verification_status` varchar(100) NOT NULL DEFAULT 'pending',
  `verified_at` timestamp NULL DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctors_license_no_unique` (`license_no`),
  KEY `doctors_user_id_foreign` (`user_id`),
  KEY `doctors_primary_hospital_id_foreign` (`primary_hospital_id`),
  KEY `doctors_specialty_index` (`specialty`),
  KEY `doctors_sub_specialty_index` (`sub_specialty`),
  KEY `doctors_gender_index` (`gender`),
  KEY `doctors_city_index` (`city`),
  KEY `doctors_state_index` (`state`),
  KEY `doctors_country_index` (`country`),
  KEY `doctors_verification_status_index` (`verification_status`),
  KEY `doctors_verified_at_index` (`verified_at`),
  KEY `doctors_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `user_id`, `primary_hospital_id`, `license_no`, `specialty`, `sub_specialty`, `bio`, `qualification`, `gender`, `consultation_fee`, `follow_up_fee`, `image_path`, `chamber_address`, `available_dates`, `available_time_slots`, `city`, `state`, `country`, `verification_status`, `verified_at`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 2, 1, 'BMDC-112233', 'Cardiology', 'Interventional Cardiology', NULL, 'MBBS, FCPS (Cardiology)', 'male', 1500.00, 800.00, 'images/doctors/20e7055e-0b9a-4381-9213-0321cfbe2ed0.png', 'House 12, Road 5, Dhanmondi, Dhaka', '[\"2026-08-04\",\"2026-08-06\",\"2026-08-08\",\"2026-08-11\",\"2026-08-13\",\"2026-08-15\",\"2026-08-18\",\"2026-08-20\",\"2026-08-22\",\"2026-08-25\",\"2026-08-27\",\"2026-08-29\"]', '[\"9:00am\",\"10:00am\"]', 'Dhaka', NULL, 'Bangladesh', 'approved', '2026-07-31 01:12:40', 'active', '2026-08-02 01:12:39', '2026-08-09 05:09:31', NULL),
(2, 5, NULL, 'BMDC-998811', 'Dermatology', NULL, NULL, 'MBBS, DDV', 'male', 700.00, 800.00, 'images/doctors/e3c6de0b-625f-45ee-af55-27c7d2b4d58b.png', 'Suite 4, Level 3, Metro Tower, Gulshan, Dhaka', '[\"2026-08-04\",\"2026-08-06\",\"2026-08-08\",\"2026-08-11\",\"2026-08-13\",\"2026-08-15\",\"2026-08-18\",\"2026-08-20\",\"2026-08-22\",\"2026-08-25\",\"2026-08-27\",\"2026-08-29\"]', '[\"9:00am\",\"10:00am\"]', 'Dhaka', NULL, 'Bangladesh', 'approved', NULL, 'active', '2026-08-02 01:12:40', '2026-08-09 05:09:22', NULL),
(3, 6, NULL, 'BEMC-0101', 'Teeth', NULL, NULL, NULL, 'male', 1200.00, 1200.00, 'images/doctors/4c0e6851-b59c-4ca4-b59b-1bce22715cc1.png', 'Mental Hospital', '[\"2026-08-04\",\"2026-08-06\",\"2026-08-08\",\"2026-08-10\",\"2026-08-12\",\"2026-08-15\",\"2026-08-19\",\"2026-08-22\",\"2026-08-24\",\"2026-08-26\",\"2026-08-29\",\"2026-09-01\",\"2026-09-03\",\"2026-09-05\",\"2026-09-08\",\"2026-09-10\",\"2026-09-12\",\"2026-09-15\",\"2026-09-17\",\"2026-09-19\",\"2026-09-22\",\"2026-09-24\",\"2026-09-26\",\"2026-09-29\"]', '[\"9:00am-10:00am\",\"10:00am-11:00am\"]', 'Dhaka', NULL, NULL, 'approved', NULL, 'active', '2026-08-02 06:29:00', '2026-08-09 05:07:55', NULL),
(4, 7, NULL, 'BMDC-0120', 'Microbiology', NULL, NULL, NULL, 'male', 800.00, 800.00, 'images/doctors/22671335-fb8d-415e-b4d3-6370759ae06f.png', 'Cardio Care Cardiology.', '[\"2026-08-05\",\"2026-08-08\",\"2026-08-10\",\"2026-08-12\",\"2026-08-15\",\"2026-08-18\",\"2026-08-20\",\"2026-08-22\",\"2026-08-24\",\"2026-08-26\",\"2026-08-29\",\"2026-09-02\",\"2026-09-05\",\"2026-09-07\",\"2026-09-09\",\"2026-09-12\",\"2026-09-14\",\"2026-09-16\"]', '[\"9:00am\"]', 'Dhaka', NULL, NULL, 'approved', NULL, 'active', '2026-08-02 06:38:23', '2026-08-09 05:09:01', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_schedules`
--

DROP TABLE IF EXISTS `doctor_schedules`;
CREATE TABLE IF NOT EXISTS `doctor_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `consultation_type` varchar(100) NOT NULL DEFAULT 'in_person',
  `timezone` varchar(100) NOT NULL DEFAULT 'Asia/Dhaka',
  `working_days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`working_days`)),
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_duration_minutes` smallint(5) UNSIGNED NOT NULL DEFAULT 15,
  `break_start_time` time DEFAULT NULL,
  `break_end_time` time DEFAULT NULL,
  `daily_capacity` smallint(5) UNSIGNED NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_schedules_doctor_id_foreign` (`doctor_id`),
  KEY `doctor_schedules_hospital_id_foreign` (`hospital_id`),
  KEY `doctor_schedules_consultation_type_index` (`consultation_type`),
  KEY `doctor_schedules_is_active_index` (`is_active`),
  KEY `doctor_schedules_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor_schedules`
--

INSERT INTO `doctor_schedules` (`id`, `doctor_id`, `hospital_id`, `consultation_type`, `timezone`, `working_days`, `start_time`, `end_time`, `slot_duration_minutes`, `break_start_time`, `break_end_time`, `daily_capacity`, `is_active`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'in_person', 'Asia/Dhaka', '[\"sunday\",\"monday\",\"tuesday\",\"wednesday\",\"thursday\"]', '09:00:00', '17:00:00', 30, NULL, NULL, 1, 1, 'active', 'Seeded doctor schedule', '2026-08-02 01:12:40', '2026-08-02 01:12:40'),
(2, 4, NULL, 'in_person', 'Asia/Dhaka', '[\"wednesday\",\"saturday\",\"monday\",\"tuesday\",\"thursday\"]', '09:00:00', '09:15:00', 15, NULL, NULL, 1, 1, 'active', 'Auto-generated schedule', '2026-08-04 04:39:33', '2026-08-04 04:39:33'),
(3, 2, NULL, 'in_person', 'Asia/Dhaka', '[\"tuesday\",\"thursday\",\"saturday\"]', '09:00:00', '00:00:00', 15, NULL, NULL, 1, 1, 'active', 'Auto-generated schedule', '2026-08-04 04:39:43', '2026-08-04 04:39:43'),
(4, 3, NULL, 'in_person', 'Asia/Dhaka', '[\"tuesday\",\"thursday\",\"saturday\",\"monday\",\"wednesday\"]', '09:00:00', '10:00:00', 15, NULL, NULL, 1, 1, 'active', 'Auto-generated schedule', '2026-08-04 04:39:43', '2026-08-04 04:39:43');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_schedule_exceptions`
--

DROP TABLE IF EXISTS `doctor_schedule_exceptions`;
CREATE TABLE IF NOT EXISTS `doctor_schedule_exceptions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctor_schedule_id` bigint(20) UNSIGNED NOT NULL,
  `exception_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `exception_type` varchar(100) NOT NULL DEFAULT 'leave',
  `reason` text DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dse_sched_date_idx` (`doctor_schedule_id`,`exception_date`),
  KEY `doctor_schedule_exceptions_exception_date_index` (`exception_date`),
  KEY `doctor_schedule_exceptions_exception_type_index` (`exception_type`),
  KEY `doctor_schedule_exceptions_status_index` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) NOT NULL,
  `connection` varchar(100) NOT NULL,
  `queue` varchar(100) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
CREATE TABLE IF NOT EXISTS `hospitals` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address_line1` varchar(100) DEFAULT NULL,
  `address_line2` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hospitals_slug_unique` (`slug`),
  UNIQUE KEY `hospitals_code_unique` (`code`),
  KEY `hospitals_created_by_user_id_foreign` (`created_by_user_id`),
  KEY `hospitals_type_index` (`type`),
  KEY `hospitals_phone_index` (`phone`),
  KEY `hospitals_email_index` (`email`),
  KEY `hospitals_city_index` (`city`),
  KEY `hospitals_state_index` (`state`),
  KEY `hospitals_country_index` (`country`),
  KEY `hospitals_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hospitals`
--

INSERT INTO `hospitals` (`id`, `created_by_user_id`, `name`, `slug`, `code`, `type`, `phone`, `email`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `latitude`, `longitude`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 'Central Care Hospital', 'central-care-hospital', 'CCH-001', 'general', '0961001001', 'info@centralcare.test', '12 Green Road', NULL, 'Dhaka', 'Dhaka', NULL, 'Bangladesh', NULL, NULL, 'active', '2026-08-02 01:12:40', '2026-08-02 01:12:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `hospital_doctors`
--

DROP TABLE IF EXISTS `hospital_doctors`;
CREATE TABLE IF NOT EXISTS `hospital_doctors` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `hospital_id` bigint(20) UNSIGNED NOT NULL,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hospital_doctors_hospital_id_doctor_id_unique` (`hospital_id`,`doctor_id`),
  KEY `hospital_doctors_doctor_id_foreign` (`doctor_id`),
  KEY `hospital_doctors_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hospital_doctors`
--

INSERT INTO `hospital_doctors` (`id`, `hospital_id`, `doctor_id`, `designation`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Consultant', 'active', '2026-02-02', NULL, '2026-08-02 01:12:40', '2026-08-02 01:12:40');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(191) NOT NULL,
  `name` varchar(100) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `appointment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `record_type` varchar(100) NOT NULL DEFAULT 'consultation',
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `chief_complaint` text DEFAULT NULL,
  `clinical_notes` text DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `treatment_plan` text DEFAULT NULL,
  `vital_signs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`vital_signs`)),
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `recorded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medical_records_doctor_id_foreign` (`doctor_id`),
  KEY `medical_records_appointment_id_foreign` (`appointment_id`),
  KEY `mr_patient_doctor_recorded_idx` (`patient_id`,`doctor_id`,`recorded_at`),
  KEY `medical_records_record_type_index` (`record_type`),
  KEY `medical_records_status_index` (`status`),
  KEY `medical_records_recorded_at_index` (`recorded_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(100) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_29_125253_create_personal_access_tokens_table', 1),
(5, '2026_07_29_125403_create_permission_tables', 1),
(6, '2026_07_29_200000_create_healthcare_domain_tables', 1),
(7, '2026_08_03_000001_add_available_dates_and_time_slots_to_doctors_table', 2),
(8, '2026_08_11_063923_add_deleted_at_to_medical_records_table', 3),
(9, '2026_08_11_070001_add_profile_fields_to_patients_table', 4),
(10, '2026_08_11_070002_backfill_patient_profile_fields', 5);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
CREATE TABLE IF NOT EXISTS `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(100) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
CREATE TABLE IF NOT EXISTS `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(100) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(2, 'App\\Models\\User', 1),
(3, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 5),
(3, 'App\\Models\\User', 6),
(3, 'App\\Models\\User', 7),
(4, 'App\\Models\\User', 8),
(4, 'App\\Models\\User', 10),
(4, 'App\\Models\\User', 11),
(5, 'App\\Models\\User', 4);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(100) NOT NULL,
  `notifiable_type` varchar(100) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`),
  KEY `notifications_read_at_index` (`read_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(191) NOT NULL,
  `token` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `mrn` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(100) DEFAULT NULL,
  `blood_group` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_mrn_unique` (`mrn`),
  KEY `patients_user_id_foreign` (`user_id`),
  KEY `patients_hospital_id_foreign` (`hospital_id`),
  KEY `patients_date_of_birth_index` (`date_of_birth`),
  KEY `patients_gender_index` (`gender`),
  KEY `patients_blood_group_index` (`blood_group`),
  KEY `patients_city_index` (`city`),
  KEY `patients_state_index` (`state`),
  KEY `patients_country_index` (`country`),
  KEY `patients_status_index` (`status`),
  KEY `patients_email_index` (`email`),
  KEY `patients_phone_index` (`phone`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `hospital_id`, `name`, `email`, `phone`, `mrn`, `date_of_birth`, `gender`, `blood_group`, `city`, `state`, `country`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(7, 11, NULL, 'test2', 'test2@gmail.com', '01500000017', NULL, '2000-12-20', 'Male', 'A+', 'Dhaka', 'uttora-10', 'Bangladesh', 'active', '2026-08-11 01:01:03', '2026-08-11 03:30:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_no` varchar(100) NOT NULL,
  `appointment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `doctor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payer_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `provider` varchar(100) DEFAULT NULL,
  `method` varchar(100) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'BDT',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `due_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(100) NOT NULL DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_no_unique` (`transaction_no`),
  KEY `payments_appointment_id_foreign` (`appointment_id`),
  KEY `payments_hospital_id_foreign` (`hospital_id`),
  KEY `payments_payer_user_id_foreign` (`payer_user_id`),
  KEY `pay_patient_status_idx` (`patient_id`,`status`),
  KEY `pay_doctor_status_idx` (`doctor_id`,`status`),
  KEY `payments_provider_index` (`provider`),
  KEY `payments_method_index` (`method`),
  KEY `payments_status_index` (`status`),
  KEY `payments_paid_at_index` (`paid_at`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `transaction_no`, `appointment_id`, `patient_id`, `doctor_id`, `hospital_id`, `payer_user_id`, `provider`, `method`, `currency`, `amount`, `discount_amount`, `tax_amount`, `total_amount`, `paid_amount`, `due_amount`, `status`, `paid_at`, `meta`, `created_at`, `updated_at`) VALUES
(1, 'TRX-APT-1002', 2, 1, 1, 1, 3, 'manual', 'cash', 'BDT', 1250.00, 0.00, 0.00, 1250.00, 1250.00, 0.00, 'paid', '2026-08-01 01:12:41', NULL, '2026-08-02 01:12:41', '2026-08-02 01:12:41'),
(2, 'TRX-APT-20260811070103-BOCO-EFGS', 15, 7, 3, NULL, 11, 'manual', 'cash', 'BDT', 1200.00, 0.00, 0.00, 1200.00, 1200.00, 0.00, 'paid', '2026-08-11 01:35:24', NULL, '2026-08-11 01:35:24', '2026-08-11 01:35:24');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `guard_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'access-admin-panel', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(2, 'access-doctor-panel', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(3, 'access-patient-panel', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(4, 'access-hospital-panel', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(5, 'manage-users', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(6, 'manage-doctors', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(7, 'manage-hospitals', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(8, 'manage-appointments', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(9, 'manage-payments', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(10, 'manage-content', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(11, 'manage-reports', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(12, 'manage-notifications', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(13, 'manage-support', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(14, 'manage-roles', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(15, 'manage-settings', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(16, 'view-audit-logs', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(17, 'view-earnings', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(18, 'manage-schedule', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(100) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=MyISAM AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'healthcare-api', 'eb50d5cb9515e00f95e5cb84fb0eef1f941519adc9ec0ebda7705198479b4934', '[\"admin\"]', '2026-08-02 01:20:22', NULL, '2026-08-02 01:15:18', '2026-08-02 01:20:22'),
(2, 'App\\Models\\User', 2, 'healthcare-api', 'b37cc6edf1d7d77c17e3b48aec97550c26f072628004ca17e53caf36d4ee6234', '[\"doctor\"]', '2026-08-02 01:29:49', NULL, '2026-08-02 01:29:47', '2026-08-02 01:29:49'),
(3, 'App\\Models\\User', 1, 'healthcare-api', '7f0385fc9bebc3ea544b6f747789de0c24ed16931e358a1b2318dbec625001ce', '[\"admin\"]', '2026-08-02 04:52:15', NULL, '2026-08-02 01:30:21', '2026-08-02 04:52:15'),
(4, 'App\\Models\\User', 2, 'healthcare-api', '80b549969e50e1340b827485900dc05bccd3f7c3d81efe25e399358d16d0b58a', '[\"doctor\"]', '2026-08-02 04:53:44', NULL, '2026-08-02 04:53:42', '2026-08-02 04:53:44'),
(5, 'App\\Models\\User', 1, 'healthcare-api', 'ba0c5afc9e8804ddb5edebebab207a79604dd37ba11cab35f7b3d338d40a0d4f', '[\"admin\"]', '2026-08-02 06:40:46', NULL, '2026-08-02 04:54:48', '2026-08-02 06:40:46'),
(6, 'App\\Models\\User', 1, 'healthcare-api', 'eb9e9bca077c0ee1c3924a8c956a5aef421a140ce1486b003e1537546f48240d', '[\"admin\"]', '2026-08-03 03:43:02', NULL, '2026-08-03 03:42:57', '2026-08-03 03:43:02'),
(7, 'App\\Models\\User', 1, 'healthcare-api', 'e55185129e01c443362086e174875027e83cc66bc1d2360d8a1dd9270be4285d', '[\"admin\"]', '2026-08-03 07:22:35', NULL, '2026-08-03 05:28:36', '2026-08-03 07:22:35'),
(8, 'App\\Models\\User', 1, 'healthcare-api', '7f208955f6faae9751969abb4cec8eec537acacfee05e1529958c459b27ae2a3', '[\"admin\"]', '2026-08-04 01:16:28', NULL, '2026-08-04 01:07:38', '2026-08-04 01:16:28'),
(9, 'App\\Models\\User', 1, 'healthcare-api', 'e322d751836f9767cd3b51ed87009a8b6a3c1407ec33370049dcfc57ed64a10c', '[\"admin\"]', NULL, NULL, '2026-08-04 01:22:36', '2026-08-04 01:22:36'),
(10, 'App\\Models\\User', 1, 'healthcare-api', '4c4a8988a46e3138a0b00d3dbb0886e4f248585cf3ad390147202352efb4db38', '[\"admin\"]', '2026-08-04 01:22:48', NULL, '2026-08-04 01:22:46', '2026-08-04 01:22:48'),
(11, 'App\\Models\\User', 8, 'healthcare-api', '22586152c20a753cf86483144d69abfba9362f33c13040d246ab5888e33f0528', '[\"patient\"]', NULL, NULL, '2026-08-04 01:23:39', '2026-08-04 01:23:39'),
(12, 'App\\Models\\User', 8, 'healthcare-api', '038765b8983cae43b77933e0dc84792f3e6d1c41a9f083318560f93f20f68780', '[\"patient\"]', NULL, NULL, '2026-08-04 01:23:50', '2026-08-04 01:23:50'),
(13, 'App\\Models\\User', 8, 'healthcare-api', '18aab2a27119a34490730bb0ef3f26bae82f06c813f8c8770c89eccd120e405b', '[\"patient\"]', NULL, NULL, '2026-08-04 01:24:01', '2026-08-04 01:24:01'),
(14, 'App\\Models\\User', 2, 'healthcare-api', 'c094e52025e3091506eb173fc841eaa7be839adce942420d0b4f43b33eb25a26', '[\"doctor\"]', '2026-08-04 01:24:32', NULL, '2026-08-04 01:24:28', '2026-08-04 01:24:32'),
(15, 'App\\Models\\User', 1, 'healthcare-api', 'b0f7ad03123e55e0fb77dbeac1f8a6b900457fbbcad58eb0008b5a51eed962d1', '[\"admin\"]', '2026-08-04 04:48:19', NULL, '2026-08-04 01:25:02', '2026-08-04 04:48:19'),
(44, 'App\\Models\\User', 11, 'healthcare-api', '436eadf5511c111047381abb1cd82bbe9d9899f780019416920fc9da660af9ac', '[\"patient\"]', '2026-08-11 03:37:54', NULL, '2026-08-11 03:37:33', '2026-08-11 03:37:54'),
(43, 'App\\Models\\User', 6, 'healthcare-api', '2b9337b6bd19da5f900d37ec6c30cc2bcc5b6f7e00e4799ba478fb2e75e9c715', '[\"doctor\"]', '2026-08-11 04:58:22', NULL, '2026-08-11 01:01:34', '2026-08-11 04:58:22'),
(18, 'App\\Models\\User', 1, 'healthcare-api', '49925dd1d7bd824699b1e149ad7cd2d3bf8aa8c39519b2f52ec2ac644fdf3514', '[\"admin\"]', '2026-08-04 05:00:25', NULL, '2026-08-04 05:00:05', '2026-08-04 05:00:25'),
(42, 'App\\Models\\User', 11, 'healthcare-api', '8bf3782f1b35c96951dca60bb7eb57c0fd69fb9271c0294cf8f9b5d0087e0f74', '[\"patient\"]', '2026-08-11 03:37:23', NULL, '2026-08-11 01:00:22', '2026-08-11 03:37:23'),
(20, 'App\\Models\\User', 1, 'healthcare-api', 'f99c05a5d4167de8129dce913c76e183c3a0fe0fbd6a7accbd1eeb2424373fe8', '[\"admin\"]', '2026-08-05 00:06:18', NULL, '2026-08-04 05:07:07', '2026-08-05 00:06:18'),
(41, 'App\\Models\\User', 6, 'healthcare-api', '04055912b46c7a1b719a5d396a2dc3b2178f998dbcf9a318fe403f1cf01e3263', '[\"doctor\"]', '2026-08-11 00:59:36', NULL, '2026-08-11 00:41:26', '2026-08-11 00:59:36'),
(22, 'App\\Models\\User', 1, 'healthcare-api', '2592686c148f5478d64a43470f4dae8f74f5e33cc2433da872d82ab2fe34f35c', '[\"admin\"]', '2026-08-05 00:07:15', NULL, '2026-08-05 00:07:13', '2026-08-05 00:07:15'),
(40, 'App\\Models\\User', 11, 'healthcare-api', '1c2d6f58cb3b849771360aff01d77d5f3635016aadb1694bef631fa375e01277', '[\"patient\"]', '2026-08-11 00:40:49', NULL, '2026-08-11 00:19:50', '2026-08-11 00:40:49'),
(24, 'App\\Models\\User', 1, 'healthcare-api', 'dfde0e5c6f7a976187b5cd05280e9e132e0eca7d1a2c107b8dd7da0ce9eac543', '[\"admin\"]', '2026-08-05 02:35:27', NULL, '2026-08-05 00:11:49', '2026-08-05 02:35:27'),
(25, 'App\\Models\\User', 2, 'healthcare-api', 'fa5d0c60cc67e16fe328d483fdd0106e8684b41a26a9e33413de5fcf5e9be533', '[\"doctor\"]', '2026-08-09 02:32:12', NULL, '2026-08-09 01:50:44', '2026-08-09 02:32:12'),
(26, 'App\\Models\\User', 10, 'healthcare-api', '654712880bd0a73c9826a65f704516681b55ad449289c8156af2b48f0961c672', '[\"patient\"]', '2026-08-09 03:30:33', NULL, '2026-08-09 01:54:05', '2026-08-09 03:30:33'),
(27, 'App\\Models\\User', 1, 'healthcare-api', 'bee60f13858ff843710ea4de972785d0dee8f714ff50091c7e25ab39ff0f0827', '[\"admin\"]', '2026-08-09 03:12:20', NULL, '2026-08-09 03:12:15', '2026-08-09 03:12:20'),
(28, 'App\\Models\\User', 1, 'healthcare-api', '13ab965dcf38738b4ecd51c17bf86231344793ccdd960f34bc39000ff505d064', '[\"admin\"]', '2026-08-09 04:49:06', NULL, '2026-08-09 03:31:04', '2026-08-09 04:49:06'),
(29, 'App\\Models\\User', 7, 'healthcare-api', '79db1f9a8637793fb6ad57110dcb3c1d6e2edf6b344b78459ee22515d163c923', '[\"doctor\"]', '2026-08-09 04:25:26', NULL, '2026-08-09 03:32:23', '2026-08-09 04:25:26'),
(30, 'App\\Models\\User', 7, 'healthcare-api', '19630b3ceb98749c21367adeea839c1321164e6fa0513e3e5a1f60028a999b43', '[\"doctor\"]', '2026-08-09 04:28:13', NULL, '2026-08-09 04:28:12', '2026-08-09 04:28:13'),
(31, 'App\\Models\\User', 10, 'healthcare-api', 'e6285df05f8eaa6f6dbf1d1c299146e2a575dc8d7c09b7fa9a028642ef9fa323', '[\"patient\"]', '2026-08-09 04:41:23', NULL, '2026-08-09 04:40:55', '2026-08-09 04:41:23'),
(32, 'App\\Models\\User', 5, 'healthcare-api', '2130f056c33e433244d92cc1393d9976b2890ba7fe5ee87e6e9b514e5fa2e31e', '[\"doctor\"]', '2026-08-09 04:43:49', NULL, '2026-08-09 04:43:48', '2026-08-09 04:43:49'),
(33, 'App\\Models\\User', 6, 'healthcare-api', 'c2958534dcf53f3933850758ad33135e15d0448ea80036542f1931c0f27a2e01', '[\"doctor\"]', '2026-08-09 04:48:08', NULL, '2026-08-09 04:45:15', '2026-08-09 04:48:08'),
(34, 'App\\Models\\User', 1, 'healthcare-api', '8f89ac0e5c6a489ae17ede51a9580db03eebca19ffe910e046d1dcd7b3227b1f', '[\"admin\"]', '2026-08-09 05:52:27', NULL, '2026-08-09 04:50:32', '2026-08-09 05:52:27'),
(35, 'App\\Models\\User', 2, 'healthcare-api', 'a898661dea019f58631e4d3cfc4b02c0dd642dde9ea6e0fe5664b30283f63c85', '[\"doctor\"]', '2026-08-09 04:50:47', NULL, '2026-08-09 04:50:46', '2026-08-09 04:50:47'),
(36, 'App\\Models\\User', 7, 'healthcare-api', '7e25afde6f1795ef1b70d94206e48f7be1ea225968f92be4a15415c5c68b68aa', '[\"doctor\"]', '2026-08-10 00:35:35', NULL, '2026-08-09 04:51:47', '2026-08-10 00:35:35'),
(37, 'App\\Models\\User', 1, 'healthcare-api', '59ef876fb4b8135e0f1748c86fae99ebc46437274db5c3c01a425672cf220542', '[\"admin\"]', '2026-08-10 04:00:32', NULL, '2026-08-10 00:34:40', '2026-08-10 04:00:32'),
(38, 'App\\Models\\User', 10, 'healthcare-api', '5816ef319d043194b09246a0c68f347aa87f761fef4cbeecd58a5f4fcafc3b21', '[\"patient\"]', '2026-08-10 00:57:53', NULL, '2026-08-10 00:57:52', '2026-08-10 00:57:53'),
(39, 'App\\Models\\User', 1, 'healthcare-api', 'd61c1d8088c821a74d29d98e2828d2f83a17c6d29b3362bcedd0566c74af856e', '[\"admin\"]', NULL, NULL, '2026-08-10 03:40:40', '2026-08-10 03:40:40'),
(45, 'App\\Models\\User', 11, 'healthcare-api', '1b57bf13a9058025164c2b031d3a8e8e4174b8e3936b28982fd9101c41c79268', '[\"patient\"]', '2026-08-11 03:37:58', NULL, '2026-08-11 03:37:58', '2026-08-11 03:37:58'),
(46, 'App\\Models\\User', 11, 'healthcare-api', '799af55be2fc3dc9a206be3511f4dd6318ba8efdcbf999a9b40e140357a99ff8', '[\"patient\"]', '2026-08-11 04:15:33', NULL, '2026-08-11 04:15:29', '2026-08-11 04:15:33'),
(47, 'App\\Models\\User', 6, 'healthcare-api', 'bff99c0593cf37e1155737791127fa4192db417d0d6bfdf0abd7e4f076690e2d', '[\"doctor\"]', '2026-08-11 04:15:50', NULL, '2026-08-11 04:15:49', '2026-08-11 04:15:50'),
(48, 'App\\Models\\User', 6, 'healthcare-api', '3bfe466f225226457027525773143eaa6438da5b0ff3852ab0cb39d69069e349', '[\"doctor\"]', '2026-08-11 05:10:48', NULL, '2026-08-11 04:16:47', '2026-08-11 05:10:48'),
(49, 'App\\Models\\User', 11, 'healthcare-api', '50721e64214de7248ab90c1a2e40748262de372c7e2c52477a2d4c7643e60251', '[\"patient\"]', '2026-08-11 05:30:19', NULL, '2026-08-11 05:14:46', '2026-08-11 05:30:19');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `prescription_no` varchar(100) NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `doctor_id` bigint(20) UNSIGNED NOT NULL,
  `appointment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `medical_record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'issued',
  `issued_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `follow_up_in_days` smallint(5) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescriptions_prescription_no_unique` (`prescription_no`),
  KEY `prescriptions_patient_id_foreign` (`patient_id`),
  KEY `prescriptions_doctor_id_foreign` (`doctor_id`),
  KEY `prescriptions_appointment_id_foreign` (`appointment_id`),
  KEY `prescriptions_medical_record_id_foreign` (`medical_record_id`),
  KEY `prescriptions_status_index` (`status`),
  KEY `prescriptions_issued_at_index` (`issued_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
CREATE TABLE IF NOT EXISTS `prescription_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `prescription_id` bigint(20) UNSIGNED NOT NULL,
  `medicine_name` varchar(100) NOT NULL,
  `strength` varchar(100) DEFAULT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `route` varchar(100) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `quantity` smallint(5) UNSIGNED DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pi_prescription_medicine_idx` (`prescription_id`,`medicine_name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE IF NOT EXISTS `reports` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `generated_by_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `report_type` varchar(100) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `file_path` varchar(100) DEFAULT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'queued',
  `generated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_generated_by_user_id_foreign` (`generated_by_user_id`),
  KEY `reports_report_type_index` (`report_type`),
  KEY `reports_status_index` (`status`),
  KEY `reports_generated_at_index` (`generated_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `guard_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'super-admin', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(2, 'admin', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(3, 'doctor', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(4, 'patient', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38'),
(5, 'hospital', 'web', '2026-08-02 01:12:38', '2026-08-02 01:12:38');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
CREATE TABLE IF NOT EXISTS `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(2, 3),
(3, 1),
(3, 2),
(3, 4),
(4, 1),
(4, 2),
(4, 5),
(5, 1),
(5, 2),
(6, 1),
(6, 2),
(6, 5),
(7, 1),
(7, 2),
(8, 1),
(8, 2),
(8, 3),
(8, 4),
(8, 5),
(9, 1),
(9, 2),
(9, 5),
(10, 1),
(10, 2),
(11, 1),
(11, 2),
(11, 5),
(12, 1),
(12, 2),
(13, 1),
(13, 2),
(14, 1),
(14, 2),
(15, 1),
(15, 2),
(16, 1),
(16, 2),
(17, 1),
(17, 2),
(17, 3),
(18, 1),
(18, 2),
(18, 3);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('WWT1JehzzgY9ibKeQaNJTyKzqUO3LiLr00qGSRu4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJBYmhLaE5mWGJSRDdBeHNmQXZXYWxGQkVkdWNWeTVmaHhFaTFOVjZaIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDozMDAxIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1785654877),
('pXeWOvRGZyey5HekKTADT4cRg5yShFdudJZMk8k4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'eyJfdG9rZW4iOiJXRXlWRHlhQW40ZVoycG5HenZZVURMdHhVazl6SkQydXZxUjlZT2RnIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTozMDAxIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1786343509),
('fUyjiAWwb68QGgwyhXzkVH0ne0cW1GigzufBZCfT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0', 'eyJfdG9rZW4iOiJ1ckZaQkF0b0RJMUxWYm5veTAyaGpuRGU4UG1sRkdWM05MdDVjWHlSIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTozMDAxIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1786429049);

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_no` varchar(100) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `patient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `doctor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `hospital_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_to_user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `priority` varchar(100) NOT NULL DEFAULT 'medium',
  `status` varchar(100) NOT NULL DEFAULT 'open',
  `last_message_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `support_tickets_ticket_no_unique` (`ticket_no`),
  KEY `support_tickets_user_id_foreign` (`user_id`),
  KEY `support_tickets_patient_id_foreign` (`patient_id`),
  KEY `support_tickets_doctor_id_foreign` (`doctor_id`),
  KEY `support_tickets_hospital_id_foreign` (`hospital_id`),
  KEY `support_tickets_assigned_to_user_id_foreign` (`assigned_to_user_id`),
  KEY `st_status_priority_idx` (`status`,`priority`),
  KEY `support_tickets_category_index` (`category`),
  KEY `support_tickets_priority_index` (`priority`),
  KEY `support_tickets_status_index` (`status`),
  KEY `support_tickets_last_message_at_index` (`last_message_at`),
  KEY `support_tickets_closed_at_index` (`closed_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `support_ticket_messages`
--

DROP TABLE IF EXISTS `support_ticket_messages`;
CREATE TABLE IF NOT EXISTS `support_ticket_messages` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `support_ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `message` text NOT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `is_internal` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `support_ticket_messages_user_id_foreign` (`user_id`),
  KEY `stm_ticket_created_idx` (`support_ticket_id`,`created_at`),
  KEY `support_ticket_messages_is_internal_index` (`is_internal`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'active',
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_secret` varchar(100) DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  KEY `users_status_index` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `role`, `email`, `phone`, `email_verified_at`, `password`, `status`, `two_factor_enabled`, `two_factor_secret`, `two_factor_confirmed_at`, `last_login_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin', 'admin', 'admin@healthcare.com', '01700000001', '2026-08-02 01:12:38', '$2y$12$o9aGroy3RW0n3hOSb0qb6uA/77s4XxUS9K2xrj6AkaPLgknhdMCBK', 'active', 0, NULL, NULL, '2026-08-10 03:40:40', NULL, '2026-08-02 01:12:39', '2026-08-10 03:40:40'),
(2, 'Muhammad Isalam', 'doctor', 'doctor', 'muhammad @gmail.com', '01700000002', '2026-08-02 01:12:39', '$2y$12$vY0SQizmWeuao9yVeoPJ4O9Iq7XPy.O10/CQeqJR.KWTh9Hjg0Uc2', 'active', 0, NULL, NULL, '2026-08-09 04:50:46', NULL, '2026-08-02 01:12:39', '2026-08-09 04:50:46'),
(4, 'Hospital Admin', 'hospital', 'hospital', 'hospital@healthcare.com', '01700000004', '2026-08-02 01:12:40', '$2y$12$.oyJEUZq5UP4X8MfxxgWPumv4RYzSrQdi41gfF6IXbCRI7jexfif.', 'active', 0, NULL, NULL, NULL, NULL, '2026-08-02 01:12:40', '2026-08-02 01:12:40'),
(5, 'Fuad Islam', 'doctor', 'doctor', 'fuad@gmail.com', '01700000005', '2026-08-02 01:12:40', '$2y$12$Z3bQ8tqNi/6edvGe450WmeF.EQcAJy.kU5888GjG7H1xCdM9rmO1K', 'active', 0, NULL, NULL, '2026-08-09 04:43:48', NULL, '2026-08-02 01:12:40', '2026-08-09 04:43:48'),
(6, 'Arafat Alif', 'arafat-alif-23i2cd', 'doctor', 'arafat@gmail.com', '01710000011', NULL, '$2y$12$5N3zIoYxHEmOI3YMnAeeTeFJg1pZtM1bS5jQk9WwSnjw9rNiW1FAi', 'active', 0, NULL, NULL, '2026-08-11 04:16:47', NULL, '2026-08-02 06:29:00', '2026-08-11 04:16:47'),
(7, 'Ahad', 'ahad-rbrlmv', 'doctor', 'ahad@gmail.com', '0171000022', NULL, '$2y$12$YKZOiCucMN4/2PHlKYZRFuQVOC5i4cyfTMR3O/GpjC8vgvivav69m', 'active', 0, NULL, NULL, '2026-08-09 04:51:47', NULL, '2026-08-02 06:38:23', '2026-08-09 04:51:47'),
(8, 'akash', 'akash', 'patient', 'a@gmail.com', '+8801710000000', NULL, '$2y$12$1EgGDGF9kMpA3UYAw73fFO7OvTw6jQ6CidCPHDwK9AsdN.m6J/T5y', 'active', 0, NULL, NULL, '2026-08-04 01:24:01', NULL, '2026-08-04 01:23:39', '2026-08-04 01:24:01'),
(11, 'test2', 'test2', 'patient', 'test2@gmail.com', '01500000017', NULL, '$2y$12$ZPLCrOXLuBPsSC3eRlSuyOhnaqQzlSWOPcNhUZxuYYFEEJmB7AuEa', 'active', 0, NULL, NULL, '2026-08-11 05:14:46', NULL, '2026-08-11 00:19:49', '2026-08-11 05:14:46'),
(10, 'test', 'test', 'patient', 'test@gmail.com', '01709098787', NULL, '$2y$12$Q9ADUj9V4nXepWuVLRkcD.FoQzmTYGRXPIBBWnT15iihG.3nlzAoS', 'active', 0, NULL, NULL, '2026-08-10 00:57:52', NULL, '2026-08-09 01:54:04', '2026-08-10 00:57:52');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
