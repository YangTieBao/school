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
        const fields = ['s_id', 'name'];
        queryDataFromTable('t_students', fields, queryData, req, res, ['t_class'], ['t_students.c_id=t_class.c_id']);
    },
    // 班级管理
    '3': (queryData, req, res) => {
        const fields = ['c_name', 'group_no'];
        queryDataFromTable('t_class', fields, queryData, req, res);
    },
    // 排课管理
    '4': (queryData, req, res) => {
        const fields = ['t_id', 'week', 'semester'];
        queryDataFromTable('arrange_course', fields, queryData, req, res, ['t_class', 't_teacher', 't_course'], ['arrange_course.c_id=t_class.c_id', 'arrange_course.t_id=t_teacher.t_id', 'arrange_course.co_id=t_course.co_id']);
    },
    // 周历管理
    '5': (queryData, req, res) => {
        const fields = ['week', 'semester'];
        queryDataFromTable('t_weekly', fields, queryData, req, res);
    },
    // 消息管理
    '6': (queryData, req, res) => {
        const fields = ['m_name'];
        queryDataFromTable('t_message', fields, queryData, req, res);
    },
    // 成绩管理
    '7': (queryData, req, res) => {
        const fields = ['s_id'];
        queryDataFromTable('total_score', fields, queryData, req, res, ['t_students'], ['total_score.s_id=t_students.s_id']);
    }
};

// 封装一个通用的函数用于根据多个条件查询数据（使用 OR）
const queryDataFromTable = async (table, fields, queryData, req, res, joinTables = [], joinConditions = []) => {
    try {
        const { pageSize, currentPage } = req.body;

        // 构建查询条件
        const conditions = fields.map(field => `${table}.${field} = ?`);
        const whereClause = conditions.join(' OR ');

        // 构建联合查询的部分
        let joinClause = '';
        if (joinTables.length > 0 && joinConditions.length > 0) {
            joinTables.forEach((joinTable, index) => {
                joinClause += ` JOIN ${joinTable} ON ${joinConditions[index]}`;
            });
        }

        // 1. 构建查询总数的 SQL 语句
        const sqlCount = `SELECT COUNT(*) as count FROM ${table} ${joinClause} WHERE ${whereClause}`;
        const values = Array(fields.length).fill(queryData); // 创建参数数组，重复 queryData 值
        const totalPromise = new Promise((resolve, reject) => {
            db.query(sqlCount, values, (err, results) => {
                try {
                    if (err) {
                        console.error('查询总数时出错:', err);
                        return reject('查询总数时发生错误');
                    }
                    const total = results[0].count;
                    resolve(total);
                } catch (err) {
                    console.error(err)
                }
            });
        });

        // 2. 构建查询数据的 SQL 语句
        const sqlData = `SELECT * FROM ${table} ${joinClause} WHERE ${whereClause} LIMIT ${(currentPage - 1) * pageSize}, ${pageSize}`;
        const dataPromise = new Promise((resolve, reject) => {
            db.query(sqlData, values, (err, results) => {
                try {
                    if (err) {
                        console.error('查询数据时出错:', err);
                        return reject('查询数据时发生错误');
                    }
                    resolve(results);
                    // 格式化日期字段
                    results.forEach(item => {
                        if (item.s_time) {
                            item.s_time = moment(item.s_time).format('YYYY-MM-DD HH:mm:ss');
                        }
                        if (item.e_time) {
                            item.e_time = moment(item.e_time).format('YYYY-MM-DD HH:mm:ss');
                        }
                        if (item.is_last != 0) {
                            item.is_last = '是'
                        } else {
                            item.is_last = '否'
                        }
                    });
                } catch (err) {
                    console.error(err)
                }
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
