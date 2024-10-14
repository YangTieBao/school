const express = require('express')
const moment = require('moment')
const db = require('../../2_mysql/index.js')

const router = express.Router()

//编辑功能
const editDataFunctions = {
    // 教师管理
    '1': (editData, res) => {
        editDataToTable('t_teacher', editData, 't_id', editData.t_id, res);
    },
    // 学生管理
    '2': (editData, res) => {
        editDataToTable('t_students', editData, 's_id', editData.s_id, res);
    },
    // 班级管理
    '3': (editData, res) => {
        editDataToTable('t_class', editData, 'c_id', editData.c_id, res);
    },
    // 排课管理
    '4': (editData, res) => {
        editDataToTable('arrange_course', editData, 'ac_id', editData.ac_id, res);
    },
    // 周历管理
    '5': (editData, res) => {
        editDataToTable('t_weekly', editData, 'w_id', editData.w_id, res);
    },
    // 消息管理
    '6': (editData, res) => {
        editDataToTable('t_message', editData, 'm_id', editData.m_id, res);
    },
    // 成绩管理
    '7': (editData, res) => {
        editDataToTable('total_score', editData, 'ts_id', editData.ts_id, res);
    }
};

// 封装一个通用的函数用于跟新数据
const editDataToTable = (table, editData, idField, idValue, res) => {
    try {
        const sql = `UPDATE ${table} SET ? WHERE ?? = ?`;

        // 执行更新操作
        db.query(sql, [editData, idField, idValue], (err, result) => {
            if (err) {
                console.error('更新数据时出错:', err);
                return res.status(500).send('更新数据时发生错误');
            }

            res.send({ message: '数据更新成功', result });
        });
    } catch (err) {
        console.log(err)
    }
};

// 渲染编辑数据操作的 API
router.post('/editData', (req, res) => {
    try {
        const { index } = req.body;
        const editData = req.body.addOrEditData;
        console.log(editData)
        if (editDataFunctions[index]) {
            editDataFunctions[index](editData, res);
        } else {
            res.status(400).send('无效的操作索引');
        }
    } catch (err) {
        console.log(err)
    }
});

module.exports = router;
