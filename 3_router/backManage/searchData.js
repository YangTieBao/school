const express = require('express');
const moment = require('moment');
const db = require('../../2_mysql/index.js');

const router = express.Router();

// 配置每个管理的数据查询功能
const queryDataFunctions = {
    // 教师管理
    '1': (queryData, req, res) => {
        const fields = ['t_id', 't_name', 'phone'];
        queryDataFromTable('t_teacher', fields, queryData, req, res);
    },
    // 学生管理
    '2': (queryData, req, res) => {
        const fields = ['s_id', 'c_id', 'name'];
        queryDataFromTable('t_students', fields, queryData, req, res);
    },
    // 班级管理
    '3': (queryData, req, res) => {
        const fields = ['c_id', 'c_name', 'group_no'];
        queryDataFromTable('t_class', fields, queryData, req, res);
    },
    // 排课管理
    '4': (queryData, req, res) => {
        const fields = ['ac_id', 'c_id', 't_id', 'week', 'semester', 'co_id'];
        queryDataFromTable('arrange_course', fields, queryData, req, res);
    },
    // 周历管理
    '5': (queryData, req, res) => {
        const fields = ['w_id', 'week', 'semester'];
        queryDataFromTable('t_weekly', fields, queryData, req, res);
    },
    // 消息管理
    '6': (queryData, req, res) => {
        const fields = ['m_id', 'm_name'];
        queryDataFromTable('t_message', fields, queryData, req, res);
    },
    // 成绩管理
    '7': (queryData, req, res) => {
        const fields = ['ts_id', 's_id', 'grade'];
        queryDataFromTable('total_score', fields, queryData, req, res);
    }
};

// 封装一个通用的函数用于根据多个条件查询数据（使用 OR）
const queryDataFromTable = async (table, fields, queryData, req, res) => {
    try {
        const { pageSize, currentPage } = req.body;

        const conditions = [];

        // 构建查询条件的 SQL 语句，每个字段都与 queryData 比较
        fields.forEach(field => {
            conditions.push(`${field} = ?`);
        });

        const whereClause = conditions.join(' OR ');

        // 1. 构建查询总数的Promise
        const sqlCount = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause}`;
        const values = Array(fields.length).fill(queryData); // 创建对应数量的参数数组，重复 queryData 值
        const totalPromise = new Promise((resolve, reject) => {
            db.query(sqlCount, values, (err, results) => {
                if (err) {
                    console.error('查询总数时出错:', err);
                    return reject('查询总数时发生错误');
                }
                const total = results[0].count;
                resolve(total);
            });
        });

        // 2. 构建查询数据的Promise
        const sqlData = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT ${(currentPage - 1) * pageSize},${pageSize}`;
        const dataPromise = new Promise((resolve, reject) => {
            db.query(sqlData, values, (err, results) => {
                if (err) {
                    console.error('查询数据时出错:', err);
                    return reject('查询数据时发生错误');
                }
                resolve(results);
            });
        });

        // 3. 同时执行两个查询
        const [total, data] = await Promise.all([totalPromise, dataPromise]);

        // 4. 如果没有数据，返回 404 错误
        if (data.length === 0) {
            return res.status(404).send('未找到相关数据');
        }

        // 5. 返回数据和总数给前端
        res.send({
            total, // 总记录数
            data   // 查询的数据
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器内部错误');
    }
};

// 查询数据操作的 API
router.post('/queryData', (req, res) => {
    try {
        const { index, queryData } = req.body;
        if (queryDataFunctions[index]) {
            queryDataFunctions[index](queryData, req, res);
        } else {
            res.status(400).send('无效的操作索引');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('服务器内部错误');
    }
});

module.exports = router;
