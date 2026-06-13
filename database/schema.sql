CREATE DATABASE IF NOT EXISTS lift_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lift_management;

CREATE TABLE IF NOT EXISTS lifts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '升降机名称',
  code VARCHAR(50) UNIQUE NOT NULL COMMENT '设备编号',
  location VARCHAR(200) COMMENT '安装位置',
  status TINYINT DEFAULT 0 COMMENT '状态 0-停止 1-运行 2-故障 3-维护',
  max_weight DECIMAL(10,2) COMMENT '最大载重(kg)',
  current_weight DECIMAL(10,2) DEFAULT 0 COMMENT '当前载重(kg)',
  current_floor INT DEFAULT 1 COMMENT '当前楼层',
  total_floor INT DEFAULT 10 COMMENT '总楼层数',
  speed DECIMAL(5,2) DEFAULT 0 COMMENT '运行速度(m/s)',
  last_maintenance DATE COMMENT '上次维护日期',
  next_maintenance DATE COMMENT '下次维护日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='升降机基础信息表';

CREATE TABLE IF NOT EXISTS run_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lift_id INT NOT NULL,
  start_floor INT NOT NULL COMMENT '起始楼层',
  end_floor INT NOT NULL COMMENT '到达楼层',
  weight DECIMAL(10,2) COMMENT '载重(kg)',
  duration INT COMMENT '运行时长(秒)',
  status TINYINT DEFAULT 1 COMMENT '状态 1-正常 2-异常',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lift_id) REFERENCES lifts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运行记录表';

CREATE TABLE IF NOT EXISTS maintenance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lift_id INT NOT NULL,
  type TINYINT NOT NULL COMMENT '维护类型 1-日常保养 2-定期检修 3-故障维修',
  content TEXT COMMENT '维护内容',
  worker VARCHAR(100) COMMENT '维护人员',
  status TINYINT DEFAULT 0 COMMENT '状态 0-待处理 1-进行中 2-已完成',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (lift_id) REFERENCES lifts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维护保养表';

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
  name VARCHAR(100) COMMENT '真实姓名',
  role TINYINT DEFAULT 2 COMMENT '角色 1-管理员 2-操作员 3-维护人员',
  phone VARCHAR(20) COMMENT '联系电话',
  status TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户权限表';

CREATE TABLE IF NOT EXISTS alarms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lift_id INT NOT NULL,
  type TINYINT NOT NULL COMMENT '报警类型 1-超载 2-超速 3-故障 4-维护提醒',
  level TINYINT DEFAULT 1 COMMENT '报警级别 1-警告 2-严重 3-紧急',
  message VARCHAR(500) COMMENT '报警信息',
  status TINYINT DEFAULT 0 COMMENT '状态 0-未处理 1-已处理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  handled_at TIMESTAMP NULL,
  handled_by INT COMMENT '处理人员',
  FOREIGN KEY (lift_id) REFERENCES lifts(id) ON DELETE CASCADE,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报警记录表';

INSERT INTO users (username, password, name, role, phone) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', 1, '13800138000'),
('operator', 'e10adc3949ba59abbe56e057f20f883e', '操作员', 2, '13900139000'),
('maintainer', 'e10adc3949ba59abbe56e057f20f883e', '维护人员', 3, '13700137000');

INSERT INTO lifts (name, code, location, status, max_weight, total_floor) VALUES
('1号升降机', 'LIFT-001', 'A栋1单元', 1, 2000, 20),
('2号升降机', 'LIFT-002', 'A栋2单元', 0, 2000, 20),
('3号升降机', 'LIFT-003', 'B栋1单元', 1, 1500, 15),
('4号升降机', 'LIFT-004', 'B栋2单元', 2, 1500, 15),
('5号升降机', 'LIFT-005', 'C栋1单元', 3, 3000, 25);
