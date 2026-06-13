const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let lifts = [
  { id: 1, name: '1号升降机', code: 'LIFT-001', location: 'A栋1单元', status: 1, max_weight: 2000, current_weight: 850, current_floor: 12, total_floor: 20, speed: 1.5, last_maintenance: '2024-01-15', next_maintenance: '2024-02-15', created_at: '2024-01-01 08:00:00', updated_at: '2024-01-15 10:00:00' },
  { id: 2, name: '2号升降机', code: 'LIFT-002', location: 'A栋2单元', status: 0, max_weight: 2000, current_weight: 0, current_floor: 1, total_floor: 20, speed: 0, last_maintenance: '2024-01-10', next_maintenance: '2024-02-10', created_at: '2024-01-01 08:00:00', updated_at: '2024-01-10 09:00:00' },
  { id: 3, name: '3号升降机', code: 'LIFT-003', location: 'B栋1单元', status: 1, max_weight: 1500, current_weight: 1200, current_floor: 8, total_floor: 15, speed: 1.2, last_maintenance: '2024-01-12', next_maintenance: '2024-02-12', created_at: '2024-01-02 08:00:00', updated_at: '2024-01-12 11:00:00' },
  { id: 4, name: '4号升降机', code: 'LIFT-004', location: 'B栋2单元', status: 2, max_weight: 1500, current_weight: 0, current_floor: 5, total_floor: 15, speed: 0, last_maintenance: '2024-01-05', next_maintenance: '2024-02-05', created_at: '2024-01-02 08:00:00', updated_at: '2024-01-18 14:00:00' },
  { id: 5, name: '5号升降机', code: 'LIFT-005', location: 'C栋1单元', status: 3, max_weight: 3000, current_weight: 0, current_floor: 1, total_floor: 25, speed: 0, last_maintenance: '2024-01-18', next_maintenance: '2024-02-18', created_at: '2024-01-03 08:00:00', updated_at: '2024-01-18 09:00:00' }
];

let runRecords = [
  { id: 1, lift_id: 1, start_floor: 1, end_floor: 12, weight: 850, duration: 45, status: 1, created_at: '2024-01-18 08:30:00' },
  { id: 2, lift_id: 1, start_floor: 12, end_floor: 5, weight: 320, duration: 28, status: 1, created_at: '2024-01-18 08:45:00' },
  { id: 3, lift_id: 3, start_floor: 1, end_floor: 8, weight: 1200, duration: 35, status: 1, created_at: '2024-01-18 09:00:00' },
  { id: 4, lift_id: 2, start_floor: 1, end_floor: 15, weight: 680, duration: 42, status: 1, created_at: '2024-01-18 09:15:00' },
  { id: 5, lift_id: 1, start_floor: 5, end_floor: 18, weight: 950, duration: 52, status: 2, created_at: '2024-01-18 09:30:00' }
];

let maintenanceRecords = [
  { id: 1, lift_id: 1, type: 1, content: '日常保养：检查钢丝绳、润滑各部件', worker: '张师傅', status: 2, created_at: '2024-01-15 08:00:00', completed_at: '2024-01-15 12:00:00' },
  { id: 2, lift_id: 4, type: 3, content: '故障维修：更换损坏的电机', worker: '李师傅', status: 1, created_at: '2024-01-18 14:00:00', completed_at: null },
  { id: 3, lift_id: 5, type: 2, content: '定期检修：全面检查安全装置', worker: '王师傅', status: 0, created_at: '2024-01-18 09:00:00', completed_at: null },
  { id: 4, lift_id: 2, type: 1, content: '日常保养：检查制动器、调整门机', worker: '张师傅', status: 2, created_at: '2024-01-10 08:00:00', completed_at: '2024-01-10 10:00:00' }
];

let users = [
  { id: 1, username: 'admin', password: 'e10adc3949ba59abbe56e057f20f883e', name: '管理员', role: 1, phone: '13800138000', status: 1, created_at: '2024-01-01 08:00:00', updated_at: '2024-01-01 08:00:00' },
  { id: 2, username: 'operator', password: 'e10adc3949ba59abbe56e057f20f883e', name: '操作员', role: 2, phone: '13900139000', status: 1, created_at: '2024-01-01 08:00:00', updated_at: '2024-01-01 08:00:00' },
  { id: 3, username: 'maintainer', password: 'e10adc3949ba59abbe56e057f20f883e', name: '维护人员', role: 3, phone: '13700137000', status: 1, created_at: '2024-01-01 08:00:00', updated_at: '2024-01-01 08:00:00' }
];

let alarms = [
  { id: 1, lift_id: 4, type: 3, level: 3, message: '电机故障，已停止运行，请尽快维修', status: 0, created_at: '2024-01-18 14:00:00', handled_at: null, handled_by: null, lift_name: '4号升降机' },
  { id: 2, lift_id: 1, type: 1, level: 2, message: '载重接近上限，当前载重850kg，最大载重2000kg', status: 0, created_at: '2024-01-18 08:30:00', handled_at: null, handled_by: null, lift_name: '1号升降机' },
  { id: 3, lift_id: 5, type: 4, level: 1, message: '下次维护时间为2024-02-18，请提前安排', status: 0, created_at: '2024-01-18 09:00:00', handled_at: null, handled_by: null, lift_name: '5号升降机' },
  { id: 4, lift_id: 3, type: 2, level: 2, message: '运行速度超过安全限制，请检查', status: 1, created_at: '2024-01-17 10:00:00', handled_at: '2024-01-17 11:00:00', handled_by: 2, lift_name: '3号升降机' }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const md5 = (str) => {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
  };
  const user = users.find(u => u.username === username && u.password === md5(password));
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: '用户名或密码错误' });
  }
});

app.get('/api/lifts', (req, res) => {
  res.json({ success: true, data: lifts });
});

app.get('/api/lifts/:id', (req, res) => {
  const { id } = req.params;
  const lift = lifts.find(l => l.id === parseInt(id));
  res.json({ success: true, data: lift });
});

app.post('/api/lifts', (req, res) => {
  const lift = req.body;
  lift.id = lifts.length + 1;
  lift.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  lift.updated_at = lift.created_at;
  lifts.push(lift);
  res.json({ success: true, id: lift.id });
});

app.put('/api/lifts/:id', (req, res) => {
  const { id } = req.params;
  const index = lifts.findIndex(l => l.id === parseInt(id));
  if (index !== -1) {
    lifts[index] = { ...lifts[index], ...req.body, updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') };
  }
  res.json({ success: true });
});

app.delete('/api/lifts/:id', (req, res) => {
  const { id } = req.params;
  lifts = lifts.filter(l => l.id !== parseInt(id));
  res.json({ success: true });
});

app.get('/api/run_records', (req, res) => {
  const { lift_id, start_date, end_date } = req.query;
  let data = [...runRecords];
  if (lift_id) data = data.filter(r => r.lift_id === parseInt(lift_id));
  if (start_date) data = data.filter(r => r.created_at >= start_date);
  if (end_date) data = data.filter(r => r.created_at <= end_date);
  data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, data });
});

app.get('/api/maintenance', (req, res) => {
  const { lift_id, status } = req.query;
  let data = maintenanceRecords.map(m => ({
    ...m,
    lift_name: lifts.find(l => l.id === m.lift_id)?.name || ''
  }));
  if (lift_id) data = data.filter(m => m.lift_id === parseInt(lift_id));
  if (status !== undefined) data = data.filter(m => m.status === parseInt(status));
  data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, data });
});

app.post('/api/maintenance', (req, res) => {
  const record = req.body;
  record.id = maintenanceRecords.length + 1;
  record.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  maintenanceRecords.push(record);
  res.json({ success: true, id: record.id });
});

app.put('/api/maintenance/:id', (req, res) => {
  const { id } = req.params;
  const index = maintenanceRecords.findIndex(m => m.id === parseInt(id));
  if (index !== -1) {
    maintenanceRecords[index] = { ...maintenanceRecords[index], ...req.body };
  }
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  const data = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    phone: u.phone,
    status: u.status,
    created_at: u.created_at
  }));
  res.json({ success: true, data });
});

app.post('/api/users', (req, res) => {
  const md5 = (str) => {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
  };
  const user = req.body;
  user.id = users.length + 1;
  user.password = md5(user.password);
  user.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  user.updated_at = user.created_at;
  users.push(user);
  res.json({ success: true, id: user.id });
});

app.put('/api/users/:id', (req, res) => {
  const md5 = (str) => {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
  };
  const { id } = req.params;
  const index = users.findIndex(u => u.id === parseInt(id));
  if (index !== -1) {
    const user = { ...users[index], ...req.body };
    if (user.password) user.password = md5(user.password);
    user.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    users[index] = user;
  }
  res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id !== parseInt(id));
  res.json({ success: true });
});

app.get('/api/alarms', (req, res) => {
  const { lift_id, status, level } = req.query;
  let data = alarms.map(a => ({
    ...a,
    lift_name: lifts.find(l => l.id === a.lift_id)?.name || a.lift_name || ''
  }));
  if (lift_id) data = data.filter(a => a.lift_id === parseInt(lift_id));
  if (status !== undefined) data = data.filter(a => a.status === parseInt(status));
  if (level) data = data.filter(a => a.level === parseInt(level));
  data.sort((a, b) => b.level - a.level || new Date(b.created_at) - new Date(a.created_at));
  res.json({ success: true, data });
});

app.post('/api/alarms', (req, res) => {
  const alarm = req.body;
  alarm.id = alarms.length + 1;
  alarm.created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  alarms.push(alarm);
  res.json({ success: true, id: alarm.id });
});

app.put('/api/alarms/:id', (req, res) => {
  const { id } = req.params;
  const index = alarms.findIndex(a => a.id === parseInt(id));
  if (index !== -1) {
    alarms[index] = { ...alarms[index], ...req.body };
  }
  res.json({ success: true });
});

app.get('/api/statistics', (req, res) => {
  const { lift_id } = req.query;
  let filteredRecords = runRecords;
  if (lift_id) filteredRecords = filteredRecords.filter(r => r.lift_id === parseInt(lift_id));
  
  const stats = {
    runStats: {
      total_runs: filteredRecords.length,
      avg_duration: filteredRecords.length ? filteredRecords.reduce((sum, r) => sum + r.duration, 0) / filteredRecords.length : 0,
      total_weight: filteredRecords.reduce((sum, r) => sum + r.weight, 0)
    },
    alarmStats: [
      { type: 1, count: alarms.filter(a => a.type === 1 && a.status === 0).length },
      { type: 2, count: alarms.filter(a => a.type === 2 && a.status === 0).length },
      { type: 3, count: alarms.filter(a => a.type === 3 && a.status === 0).length },
      { type: 4, count: alarms.filter(a => a.type === 4 && a.status === 0).length }
    ],
    maintenanceStats: [
      { status: 0, count: maintenanceRecords.filter(m => m.status === 0).length },
      { status: 1, count: maintenanceRecords.filter(m => m.status === 1).length },
      { status: 2, count: maintenanceRecords.filter(m => m.status === 2).length }
    ]
  };
  
  res.json({ success: true, data: stats });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
