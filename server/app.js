const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lift_management'
});

db.connect(err => {
  if (err) {
    console.error('数据库连接失败:', err);
    return;
  }
  console.log('数据库连接成功');
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = MD5(?)';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: '用户名或密码错误' });
    }
  });
});

app.get('/api/lifts', (req, res) => {
  const sql = 'SELECT * FROM lifts';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: results });
  });
});

app.get('/api/lifts/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM lifts WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: results[0] });
  });
});

app.post('/api/lifts', (req, res) => {
  const lift = req.body;
  const sql = 'INSERT INTO lifts SET ?';
  db.query(sql, lift, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: '添加失败' });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/api/lifts/:id', (req, res) => {
  const { id } = req.params;
  const lift = req.body;
  const sql = 'UPDATE lifts SET ? WHERE id = ?';
  db.query(sql, [lift, id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '更新失败' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/lifts/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM lifts WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '删除失败' });
    }
    res.json({ success: true });
  });
});

app.get('/api/run_records', (req, res) => {
  const { lift_id, start_date, end_date } = req.query;
  let sql = 'SELECT * FROM run_records WHERE 1=1';
  const params = [];
  
  if (lift_id) {
    sql += ' AND lift_id = ?';
    params.push(lift_id);
  }
  if (start_date) {
    sql += ' AND created_at >= ?';
    params.push(start_date);
  }
  if (end_date) {
    sql += ' AND created_at <= ?';
    params.push(end_date);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: results });
  });
});

app.get('/api/maintenance', (req, res) => {
  const { lift_id, status } = req.query;
  let sql = 'SELECT m.*, l.name AS lift_name FROM maintenance_records m LEFT JOIN lifts l ON m.lift_id = l.id WHERE 1=1';
  const params = [];
  
  if (lift_id) {
    sql += ' AND m.lift_id = ?';
    params.push(lift_id);
  }
  if (status) {
    sql += ' AND m.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY m.created_at DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/api/maintenance', (req, res) => {
  const record = req.body;
  const sql = 'INSERT INTO maintenance_records SET ?';
  db.query(sql, record, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: '添加失败' });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/api/maintenance/:id', (req, res) => {
  const { id } = req.params;
  const record = req.body;
  const sql = 'UPDATE maintenance_records SET ? WHERE id = ?';
  db.query(sql, [record, id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '更新失败' });
    }
    res.json({ success: true });
  });
});

app.get('/api/users', (req, res) => {
  const sql = 'SELECT id, username, name, role, phone, status, created_at FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  const sql = 'INSERT INTO users SET password = MD5(?), username = ?, name = ?, role = ?, phone = ?, status = ?';
  db.query(sql, [user.password, user.username, user.name, user.role, user.phone, user.status || 1], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: '添加失败' });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const user = req.body;
  let sql, params;
  
  if (user.password) {
    sql = 'UPDATE users SET password = MD5(?), name = ?, role = ?, phone = ?, status = ? WHERE id = ?';
    params = [user.password, user.name, user.role, user.phone, user.status, id];
  } else {
    sql = 'UPDATE users SET name = ?, role = ?, phone = ?, status = ? WHERE id = ?';
    params = [user.name, user.role, user.phone, user.status, id];
  }
  
  db.query(sql, params, (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '更新失败' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '删除失败' });
    }
    res.json({ success: true });
  });
});

app.get('/api/alarms', (req, res) => {
  const { lift_id, status, level } = req.query;
  let sql = 'SELECT a.*, l.name AS lift_name FROM alarms a LEFT JOIN lifts l ON a.lift_id = l.id WHERE 1=1';
  const params = [];
  
  if (lift_id) {
    sql += ' AND a.lift_id = ?';
    params.push(lift_id);
  }
  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }
  if (level) {
    sql += ' AND a.level = ?';
    params.push(level);
  }
  
  sql += ' ORDER BY a.level DESC, a.created_at DESC';
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    res.json({ success: true, data: results });
  });
});

app.post('/api/alarms', (req, res) => {
  const alarm = req.body;
  const sql = 'INSERT INTO alarms SET ?';
  db.query(sql, alarm, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: '添加失败' });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/api/alarms/:id', (req, res) => {
  const { id } = req.params;
  const alarm = req.body;
  const sql = 'UPDATE alarms SET ? WHERE id = ?';
  db.query(sql, [alarm, id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: '更新失败' });
    }
    res.json({ success: true });
  });
});

app.get('/api/statistics', (req, res) => {
  const { lift_id, start_date, end_date } = req.query;
  
  const stats = {};
  
  const countSql = `
    SELECT COUNT(*) as total_runs, 
           AVG(duration) as avg_duration,
           SUM(weight) as total_weight
    FROM run_records 
    WHERE 1=1 ${lift_id ? 'AND lift_id = ?' : ''} 
          ${start_date ? 'AND created_at >= ?' : ''}
          ${end_date ? 'AND created_at <= ?' : ''}
  `;
  
  const params = [];
  if (lift_id) params.push(lift_id);
  if (start_date) params.push(start_date);
  if (end_date) params.push(end_date);
  
  db.query(countSql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '查询失败' });
    }
    
    stats.runStats = results[0];
    
    const alarmSql = `
      SELECT type, COUNT(*) as count
      FROM alarms 
      WHERE status = 0 ${lift_id ? 'AND lift_id = ?' : ''}
      GROUP BY type
    `;
    
    const alarmParams = lift_id ? [lift_id] : [];
    db.query(alarmSql, alarmParams, (err, alarmResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: '查询失败' });
      }
      
      stats.alarmStats = alarmResults;
      
      const maintenanceSql = `
        SELECT status, COUNT(*) as count
        FROM maintenance_records 
        ${lift_id ? 'WHERE lift_id = ?' : ''}
        GROUP BY status
      `;
      
      const maintenanceParams = lift_id ? [lift_id] : [];
      db.query(maintenanceSql, maintenanceParams, (err, maintenanceResults) => {
        if (err) {
          return res.status(500).json({ success: false, message: '查询失败' });
        }
        
        stats.maintenanceStats = maintenanceResults;
        res.json({ success: true, data: stats });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
