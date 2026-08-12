CREATE SCHEMA IF NOT EXISTS `zstack_ui`;
USE `zstack_ui`;

CREATE TABLE `zstack_ui`.`api_call` (
  `uuid` CHAR(35) NOT NULL COMMENT 'UUID',
  `data` MEDIUMBLOB NOT NULL COMMENT '原始数据',
  `create_time` DATETIME NOT NULL COMMENT '创建时间',
  `update_time` DATETIME COMMENT '最后更新时间',
  PRIMARY KEY (`uuid`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8
COMMENT 'Call表';

CREATE TABLE `zstack_ui`.`event` (
  `uuid` CHAR(35) NOT NULL COMMENT 'UUID',
  `ip` VARCHAR(40) NOT NULL COMMENT 'IP地址',
  `title` VARCHAR(250) NOT NULL COMMENT '标题',
  `data` MEDIUMBLOB NOT NULL COMMENT '原始数据',
  `zone` CHAR(35) COMMENT '区域',
  `creator` CHAR(35) NOT NULL COMMENT '操作员',
  `status` ENUM('UNDONE', 'OK', 'ERR', 'MIX', 'CANCEL') NOT NULL COMMENT '执行状态',
  `creator_type` ENUM('ACCOUNT', 'USER', 'LDAP', 'VIRTUALID') NOT NULL COMMENT '操作员类型',
  `create_time` DATETIME NOT NULL COMMENT '创建时间',
  `update_time` DATETIME COMMENT '最后更新时间',
  `project_uuid` CHAR(35) COMMENT '项目UUID',
  PRIMARY KEY (`uuid`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8
COMMENT 'Event表';

CREATE TABLE `zstack_ui`.`zs_session` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `sessionId` VARCHAR(32) NOT NULL,
  `uid` VARCHAR(32) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `accountUuid` VARCHAR(32) NOT NULL,
  `identity` VARCHAR(32) NOT NULL,
  `create_date` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `AccountUuidIndex` (`accountUuid`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8
COMMENT 'session IDs belong to accountUuid; uid is a compatibility mirror';

CREATE TABLE `zstack_ui`.`message_cache` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid` VARCHAR(32) NOT NULL,
  `msg` BLOB NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8
COMMENT 'message cache';

CREATE TABLE `zstack_ui`.`plugin` (
  `uuid` CHAR(35) NOT NULL COMMENT 'UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '插件名',
  `url` VARCHAR(200) NOT NULL COMMENT '插件url',
  `description` VARCHAR(250) COMMENT '简介',
  `category` ENUM('STORAGE', 'DB', 'SECURITY', 'PaaS', 'SaaS', 'IaaS') NOT NULL COMMENT '类别',
  `recommend_app` ENUM('XSKY', 'RANCHER', 'ANHENG', 'CUSTOM') COMMENT '推荐应用',
  `visible_access` ENUM('ADMIN', 'ALL', 'CUSTOM') DEFAULT 'ALL' COMMENT '可见权限',
  `logo` BLOB COMMENT 'logo base64',
  `created_by` CHAR(35) NOT NULL COMMENT '创建人',
  `create_time` DATETIME NOT NULL COMMENT '创建时间',
  `config_info` CHAR(255) COMMENT '配置信息',
  PRIMARY KEY (`uuid`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8
COMMENT '插件表';

CREATE TABLE `zstack_ui`.`zs_soldier` (
  `soldier_id` VARCHAR(200) NOT NULL,
  `account_id` VARCHAR(200) NOT NULL,
  `passcode` TEXT NOT NULL,
  `create_date` DATETIME NOT NULL,
  UNIQUE INDEX `soldier_id` (`soldier_id`),
  UNIQUE INDEX `account_id` (`account_id`)
)
COLLATE = utf8_general_ci
ENGINE = InnoDB;

CREATE TABLE `zstack_ui`.`zs_ui_config` (
  `name` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `defaultValue` TEXT NOT NULL,
  PRIMARY KEY (`name`)
)
COLLATE = utf8_general_ci
ENGINE = InnoDB;

INSERT INTO `zstack_ui`.`zs_ui_config` (`name`, `value`, `defaultValue`) VALUES
  ('operation.max.history', '7776000000', '7776000000'),
  ('virtualrouter.arm.enable', 'false', 'false'),
  ('tag.sort.by', 'tagName', 'tagName'),
  ('vm.create.limit.num', '100', '100'),
  ('default.login.portal', 'iam-and-iam2', 'iam-and-iam2'),
  ('vm.check.guest.tools', 'true', 'true'),
  ('api.timeout', '1800', '1800'),
  ('delete.resource.double.check', 'true', 'true'),
  ('iam2project.login.portal', '{"cas":{"enable":false,"type":"donghai"},"defaultLoginType":"local-iam2-user"}', '{"cas":{"enable":false,"type":"donghai"},"defaultLoginType":"local-iam2-user"}'),
  ('vm.list.view.display', 'listView', 'listView'),
  ('cryptocompliance.dataprotection.operationLogDays', '0,0', '0,0'),
  ('vmInstance.anti.deletion.protection', 'false', 'false'),
  ('experience.upgrade.program', 'false', 'false'),
  ('novnc.resource.permission.check', 'false', 'false'),
  ('cryptocompliance.start.dataprotection.time', '', '');

CREATE TABLE `zstack_ui`.`zs_ui_list_config` (
  `account_uuid` CHAR(35) NOT NULL,
  `list_config` VARCHAR(200) NOT NULL,
  `page_name` VARCHAR(40) NOT NULL,
  CONSTRAINT `list_config_id` PRIMARY KEY (`account_uuid`, `page_name`)
)
COLLATE = utf8_general_ci
ENGINE = InnoDB;

INSERT INTO `zstack_ui`.`zs_ui_list_config` (`account_uuid`, `list_config`, `page_name`) VALUES
  ('admin_default', 'name,tag,cpu,memory,ip,hostIp,cluster,state,owner,haLeval,createDate', 'vm_page'),
  ('account_default', 'name,tag,cpu,memory,ip,state,haLeval,createDate', 'vm_page');

CREATE TABLE `zstack_ui`.`zs_flow` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `main_job_id` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `flow` MEDIUMTEXT NULL DEFAULT NULL COLLATE utf8_general_ci,
  `state` ENUM('READY', 'RUNNING', 'FINISHED', 'STOPPING', 'STOPPED', 'ABORTED', 'CANCELED', 'ROLLINGBACK', 'ROLLEDBACK') NULL DEFAULT NULL COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NULL DEFAULT NULL,
  `last_op_date` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `main_job_id` (`main_job_id`) USING BTREE,
  INDEX `create_date` (`create_date`) USING BTREE,
  INDEX `last_op_date` (`last_op_date`) USING BTREE
)
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zs_action_api` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `api_id` VARCHAR(32) NOT NULL COLLATE utf8_general_ci,
  `task_id` VARCHAR(32) NOT NULL COLLATE utf8_general_ci,
  `name` VARCHAR(1024) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `req` MEDIUMTEXT NULL DEFAULT NULL COLLATE utf8_general_ci,
  `resp` MEDIUMTEXT NULL DEFAULT NULL COLLATE utf8_general_ci,
  `status` ENUM('Running', 'Success', 'Failed', 'Canceled', 'Canceling', 'Suspended', 'Unknown') NULL DEFAULT NULL COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NULL DEFAULT NULL,
  `last_op_date` TIMESTAMP NULL DEFAULT NULL,
  `signed_text` MEDIUMTEXT DEFAULT NULL,
  `resources` TEXT DEFAULT NULL,
  `action_id` VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `api_id` (`api_id`) USING BTREE,
  INDEX `task_id` (`task_id`) USING BTREE,
  INDEX `name` (`name`(255)) USING BTREE,
  INDEX `create_date` (`create_date`) USING BTREE,
  INDEX `last_op_date` (`last_op_date`) USING BTREE,
  INDEX `status` (`status`) USING BTREE
)
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zs_action_task` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `action_id` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `status` ENUM('Running', 'Success', 'Failed', 'Canceled', 'Canceling', 'Exception', 'Suspended', 'Unknown') NULL DEFAULT NULL COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NULL DEFAULT NULL,
  `last_op_date` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `create_date` (`create_date`) USING BTREE,
  INDEX `last_op_date` (`last_op_date`) USING BTREE,
  INDEX `status` (`status`) USING BTREE,
  INDEX `task_id` (`task_id`) USING BTREE,
  INDEX `action_id` (`action_id`) USING BTREE
)
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zs_action` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `action_id` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `key` VARCHAR(1024) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `name` VARCHAR(1024) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `status` ENUM('Running', 'Success', 'Failed', 'Canceled', 'Canceling', 'Exception', 'Suspended', 'Unknown') NULL DEFAULT NULL COLLATE utf8_general_ci,
  `login_ip` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `user_id` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NULL DEFAULT NULL,
  `last_op_date` TIMESTAMP NULL DEFAULT NULL,
  `user_name` VARCHAR(1024) DEFAULT NULL,
  `resource_uuids` VARCHAR(1024) DEFAULT NULL,
  `progress` INT(4) DEFAULT NULL,
  `account_uuid` VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `action_id` (`action_id`) USING BTREE,
  INDEX `create_date` (`create_date`) USING BTREE,
  INDEX `last_op_date` (`last_op_date`) USING BTREE,
  INDEX `status` (`status`) USING BTREE
)
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zs_long_job` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `long_job_uuid` VARCHAR(32) NOT NULL COMMENT '任务UUID' COLLATE utf8_general_ci,
  `client_job_uuid` VARCHAR(32) NOT NULL COMMENT '客户任务UUID' COLLATE utf8_general_ci,
  `job_name` VARCHAR(128) NOT NULL COMMENT '任务名' COLLATE utf8_general_ci,
  `resource_type` VARCHAR(128) NOT NULL COLLATE utf8_general_ci,
  `data` MEDIUMTEXT NOT NULL COMMENT '任务数据' COLLATE utf8_general_ci,
  `progress` DECIMAL(10, 0) NULL DEFAULT NULL COMMENT '进度',
  `state` ENUM('RUNNING', 'SUCCESS', 'FAILED', 'CANCELED', 'CANCELING', 'UNKNOWN', 'SUSPENDED') NULL DEFAULT NULL COLLATE utf8_general_ci,
  `user_id` VARCHAR(32) NOT NULL COMMENT '帐户UUID' COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '开始时间',
  `last_op_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '完成时间',
  `action_id` VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `longjob_uuid` (`long_job_uuid`) USING BTREE,
  INDEX `client_job_uuid` (`client_job_uuid`) USING BTREE,
  INDEX `account_uuid` (`user_id`) USING BTREE
)
COMMENT = '任务表'
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zs_kv` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(50) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `value` TEXT NULL DEFAULT NULL COLLATE utf8_general_ci,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id` (`id`) USING BTREE,
  UNIQUE INDEX `key` (`key`) USING BTREE
)
COMMENT = '用于记录一些内部的状态'
COLLATE = utf8_general_ci
ENGINE = InnoDB;

INSERT INTO `zstack_ui`.`zs_kv` (`key`, `value`) VALUES
  ('community.agreement', 'false');

CREATE TABLE `zstack_ui`.`zs_role_privilege` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `uuid` VARCHAR(32) NOT NULL DEFAULT '0' COLLATE utf8_general_ci,
  `system_role_uuid` VARCHAR(32) NULL DEFAULT NULL COLLATE utf8_general_ci,
  `role_uuid` VARCHAR(32) NOT NULL DEFAULT '0' COLLATE utf8_general_ci COMMENT 'IAM2角色Uuid',
  `privilege` MEDIUMTEXT NULL DEFAULT NULL COLLATE utf8_general_ci COMMENT '权限具体内容',
  `version` INT(11) NOT NULL DEFAULT 1 COMMENT '版本号',
  `create_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '创建时间',
  `last_op_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '更新时间',
  `signed_text` MEDIUMTEXT DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
)
COLLATE = utf8_general_ci
ENGINE = InnoDB;

CREATE TABLE `zstack_ui`.`zs_profile` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT 'profielID',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户UUID' COLLATE utf8_general_ci,
  `identity` VARCHAR(32) NOT NULL COMMENT '用户UUID' COLLATE utf8_general_ci,
  `type` VARCHAR(256) NOT NULL COLLATE utf8_general_ci,
  `content` MEDIUMTEXT NULL DEFAULT NULL COMMENT '信息内容' COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '开始时间',
  `last_op_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '完成时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id` (`user_id`) USING BTREE
)
COMMENT = '用户信息表'
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zops_long_job` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `long_job_uuid` VARCHAR(32) NOT NULL COMMENT '任务UUID' COLLATE utf8_general_ci,
  `client_job_uuid` VARCHAR(32) NOT NULL COMMENT '客户任务UUID' COLLATE utf8_general_ci,
  `job_name` VARCHAR(128) NOT NULL COMMENT '任务名' COLLATE utf8_general_ci,
  `resource_type` VARCHAR(128) NOT NULL COLLATE utf8_general_ci,
  `data` MEDIUMTEXT NOT NULL COMMENT '任务数据' COLLATE utf8_general_ci,
  `progress` DECIMAL(10, 0) NULL DEFAULT NULL COMMENT '进度',
  `state` ENUM('INIT', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELED', 'SUSPENDED') NULL DEFAULT NULL COLLATE utf8_general_ci,
  `user_id` VARCHAR(32) NOT NULL COMMENT '帐户UUID' COLLATE utf8_general_ci,
  `create_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '开始时间',
  `last_op_date` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '完成时间',
  `read_status` VARCHAR(32) NOT NULL COMMENT '已读状态' COLLATE utf8_general_ci,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `longjob_uuid` (`long_job_uuid`) USING BTREE,
  INDEX `client_job_uuid` (`client_job_uuid`) USING BTREE,
  INDEX `account_uuid` (`user_id`) USING BTREE
)
COMMENT = 'ZOPS任务表'
COLLATE = utf8_general_ci
ENGINE = InnoDB
AUTO_INCREMENT = 0;

CREATE TABLE `zstack_ui`.`zs_log_collect` (
  `uuid` VARCHAR(64) NOT NULL COMMENT 'UUID' COLLATE utf8_general_ci,
  `type` VARCHAR(128) NULL DEFAULT NULL COMMENT '类型' COLLATE utf8_general_ci,
  `name` VARCHAR(256) NULL DEFAULT NULL COMMENT '名称' COLLATE utf8_general_ci,
  `host` VARCHAR(64) NULL DEFAULT NULL COMMENT '节点ip' COLLATE utf8_general_ci,
  `dir` VARCHAR(256) NULL DEFAULT NULL COMMENT '收集目录' COLLATE utf8_general_ci,
  `state` ENUM('RUNNING', 'SUCCESS', 'FAILED') NULL DEFAULT NULL COMMENT '状态' COLLATE utf8_general_ci,
  `url` VARCHAR(512) NULL DEFAULT NULL COMMENT '下载路径' COLLATE utf8_general_ci,
  `start_time` TIMESTAMP NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` TIMESTAMP NULL DEFAULT NULL COMMENT '结束时间',
  `create_date` TIMESTAMP NULL DEFAULT NULL COMMENT '创建时间',
  `last_op_date` TIMESTAMP NULL DEFAULT NULL COMMENT '最后更新时间',
  PRIMARY KEY (`uuid`) USING BTREE
)
COMMENT = '日志收集表'
COLLATE = utf8_general_ci
ENGINE = InnoDB;

CREATE TABLE `zstack_ui`.`zs_resumable_upload_session` (
  `id` VARCHAR(32) NOT NULL,
  `session_id` VARCHAR(64) DEFAULT NULL,
  `user_uuid` VARCHAR(32) DEFAULT NULL,
  `account_uuid` VARCHAR(32) DEFAULT NULL,
  `upload_type` ENUM('image', 'storagePackage', 'migrationServicePackage') NOT NULL,
  `hash` VARCHAR(128) NOT NULL,
  `file_name` VARCHAR(512) DEFAULT NULL,
  `file_size` BIGINT DEFAULT NULL,
  `last_modified` BIGINT DEFAULT NULL,
  `long_job_uuid` VARCHAR(32) NOT NULL,
  `artifact_uuid` VARCHAR(32) DEFAULT NULL,
  `upload_url` TEXT DEFAULT NULL,
  `offset` BIGINT DEFAULT 0,
  `status` ENUM('UPLOADING', 'WAITING_FOR_FILE_CHECK', 'RETRY_WAITING', 'RETRYING', 'RETRY_READY', 'WAITING_FOR_FILE', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELED', 'RETRY_EXHAUSTED', 'EXPIRED') NOT NULL DEFAULT 'UPLOADING',
  `error_reason` TEXT DEFAULT NULL,
  `job_name` VARCHAR(128) DEFAULT NULL,
  `job_data` MEDIUMTEXT DEFAULT NULL,
  `action_name` VARCHAR(256) DEFAULT NULL,
  `resource_type` VARCHAR(128) DEFAULT NULL,
  `retry_count` INT DEFAULT 0,
  `max_retry_count` INT DEFAULT 5,
  `next_retry_at` DATETIME DEFAULT NULL,
  `last_retry_at` DATETIME DEFAULT NULL,
  `retry_status` VARCHAR(64) DEFAULT NULL,
  `file_available` TINYINT(1) DEFAULT 0,
  `file_available_until` DATETIME DEFAULT NULL,
  `root_session_id` VARCHAR(64) DEFAULT NULL,
  `replaced_from_long_job_uuid` VARCHAR(32) DEFAULT NULL,
  `previous_long_job_uuid` VARCHAR(32) DEFAULT NULL,
  `retry_owner` VARCHAR(128) DEFAULT NULL,
  `retry_locked_until` DATETIME DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_op_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_zs_resumable_upload_session_long_job_uuid` (`long_job_uuid`),
  KEY `idx_zs_resumable_upload_session_user_status` (`user_uuid`, `status`, `expires_at`, `last_op_date`),
  KEY `idx_zs_resumable_upload_session_session_status` (`session_id`, `status`),
  KEY `idx_zs_resumable_upload_session_status_last_op_date` (`status`, `last_op_date`),
  KEY `idx_zs_resumable_upload_session_hash_type` (`upload_type`, `hash`, `user_uuid`),
  KEY `idx_zs_resumable_upload_session_retry` (`status`, `retry_status`, `next_retry_at`, `file_available_until`)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8;
