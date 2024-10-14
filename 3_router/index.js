const express = require('express')
const moment = require('moment')
const db = require('../2_mysql/index.js')

const router = express.Router()

//登录
router.post('/login', (req, res) => {
    const { username, password } = req.body
    const sql = `SELECT * FROM t_teacher WHERE t_id = '${username}' AND password = '${password}'`
    db.query(sql, (err, results) => {
        if (err) {
            console.error('查询数据库出错:', err);
            return res.status(500).send('服务器内部错误');
        }
        if (results.length === 0) {
            return res.status(401).send('用户名或密码错误');
        }
        res.send(results);
    });
})

//修改密码
router.post('/revisePassword', (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    console.log(username, oldPassword, newPassword)

    // 查询数据库，验证用户名和旧密码是否匹配
    const selectSql = `SELECT * FROM t_teacher WHERE t_id = '${username}' AND password = '${oldPassword}'`;

    db.query(selectSql, (err, results) => {
        if (err) {
            console.error('查询数据库出错:', err);
            return res.status(500).send('服务器内部错误');
        }

        // 如果未找到匹配的用户，返回错误提示
        if (results.length === 0) {
            return res.status(401).send('用户名或旧密码错误');
        }

        // 如果找到匹配用户，更新密码
        const updateSql = `UPDATE t_teacher SET password = '${newPassword}' WHERE t_id = '${username}'`;

        db.query(updateSql, (err, updateResult) => {
            if (err) {
                console.error('更新密码时出错:', err);
                return res.status(500).send('服务器内部错误');
            }

            res.send('密码修改成功');
        });
    });
});


module.exports = router