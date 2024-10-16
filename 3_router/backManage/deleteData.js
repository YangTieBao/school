const express = require('express')
const moment = require('moment')
const db = require('../../2_mysql/index.js')

const router = express.Router()

// 配置每个管理的数据删除功能
const deleteDataFunctions = {
    // 教师管理
    '1': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.t_id);
        deleteDataToTable('t_teacher', 't_id', deleteId, res)
    },
    // 学生管理
    '2': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.s_id);
        deleteDataToTable('t_students', 's_id', deleteId, res);
    },
    // 班级管理
    '3': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.c_id);
        deleteDataToTable('t_class', 'c_id', deleteId, res);
    },
    // 排课管理
    '4': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.ac_id);
        deleteDataToTable('arrange_course', 'ac_id', deleteId, res);
    },
    // 周历管理
    '5': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.w_id);
        deleteDataToTable('t_weekly', 'w_id', deleteId, res);
    },
    // 消息管理
    '6': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.m_id);
        deleteDataToTable('t_message', 'm_id', deleteId, res);
    },
    // 成绩管理
    '7': (deleteData, res) => {
        const deleteId = deleteData.map(item => item.ts_id);
        deleteDataToTable('total_score', 'ts_id', deleteId, res);
    }
};

// 封装一个通用的函数用于删除数据
const deleteDataToTable = (table, idField, idValue, res) => {
    try {
        // 构建删除 SQL 语句
        const sql = `DELETE FROM ${table} WHERE ${idField} IN (?)`;

        // 执行删除操作
        db.query(sql, [idValue], (err, results) => {
            try {
                if (err) {
                    console.error('删除数据时出错:', err);
                    return res.status(500).send('删除数据时发生错误');
                }
                res.send({ message: '删除数据成功！' });
            } catch (err) {
                console.error(err)
            }
        });
    } catch (err) {
        console.log(err)
    }
};

//删除单独数据操作的 API
router.post('/deleteData', (req, res) => {
    try {
        const { index, deleteData } = req.body;
        if (deleteDataFunctions[index]) {
            deleteDataFunctions[index](deleteData, res);
        } else {
            res.status(400).send('无效的操作索引');
        }
    } catch (err) {
        console.log(err)
    }
});

//删除所选择的数据操作的 API
router.post('/deleteSelectedData', (req, res) => {
    try {
        const { index, deleteData } = req.body;
        if (deleteDataFunctions[index]) {
            deleteDataFunctions[index](deleteData, res);
        } else {
            res.status(400).send('无效的操作索引');
        }
    } catch (err) {
        console.log(err)
    }
});

module.exports = router;
