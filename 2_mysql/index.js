const mysql = require('mysql')

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'ytb@2003',
    database: 'school'
})

// 连接数据库
db.connect(err => {
    if (err) {
        console.error('数据库连接失败:', err.stack);
        return;
    }
    console.log('成功连接到数据库!');
});

module.exports = db

