const express = require('express')
const moment = require('moment')
const db = require('../../2_mysql/index.js')

const router = express.Router()

// 配置每个管理的数据添加功能
const addDataFunctions = {
    // 教师管理
    '1': (addData, res) => {
        addDataToTable('t_teacher', addData, res);
    },
    // 学生管理
    '2': (addData, res) => {
        addDataToTable('t_students', addData, res);
    },
    // 班级管理
    '3': (addData, res) => {
        addDataToTable('t_class', addData, res);
    },
    // 排课管理
    '4': (addData, res) => {
        addDataToTable('arrange_course', addData, res);
    },
    // 周历管理
    '5': (addData, res) => {
        addDataToTable('t_weekly', addData, res);
    },
    // 消息管理
    '6': (addData, res) => {
        addDataToTable('t_message', addData, res);
    },
    // 成绩管理
    '7': (addData, res) => {
        addDataToTable('total_score', addData, res);
    }
};

// 封装一个通用的函数用于插入数据
const addDataToTable = (table, addData, res) => {
    try {
        const sql = `INSERT INTO ${table} set ?`;

        // 执行插入操作
        db.query(sql, addData, (err, result) => {
            if (err) {
                console.error('插入数据时出错:', err);
                return res.status(500).send('插入数据时发生错误');
            }

            res.send({ message: '数据添加成功', result });
        });
    } catch (err) {
        console.log(err)
    }
};

// 渲染添加数据操作的 API
router.post('/addData', (req, res) => {
    try {
        const { index } = req.body;
        const addData = req.body.addOrEditData;
        if (addDataFunctions[index]) {
            addDataFunctions[index](addData, res);
        } else {
            res.status(400).send('无效的操作索引');
        }
    } catch (err) {
        console.log(err)
    }
});

module.exports = router;
