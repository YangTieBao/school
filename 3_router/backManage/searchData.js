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
        searchTotalScore(req, res)
    },
    // 课程管理
    '8': (queryData, req, res) => {
        const fields = ['co_name'];
        queryDataFromTable('t_course', fields, queryData, req, res);
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

// 查询总成绩表
async function searchTotalScore(req, res) {
    const { pageSize, currentPage, queryData, totalQueryData } = req.body;
    // SQL 查询语句
    let sqlCount = `SELECT count(DISTINCT ts.s_id) as count
    FROM total_score AS ts
    JOIN t_students ON ts.s_id = t_students.s_id
    LEFT JOIN t_class ON t_students.c_id = t_class.c_id
    LEFT JOIN course_score AS cs ON t_students.s_id = cs.s_id
    WHERE 1=1
    ${queryData != null && queryData != `` ? 
        `AND (t_students.s_id = '${queryData}' 
              OR t_students.name = '${queryData}' 
              OR t_class.c_name = '${queryData}')` 
        : ``}
    ${totalQueryData != null && totalQueryData != `` ? 
        `AND t_class.group_no = ${totalQueryData}` 
        : ``}`;
    let sqlData = `
        SELECT t_students.s_id as s_id, t_students.name, t_class.c_name, t_class.group_no, cs.*, ts.*
        FROM t_students
        LEFT JOIN t_class ON t_students.c_id = t_class.c_id
        LEFT JOIN course_score AS cs ON t_students.s_id = cs.s_id
        JOIN total_score AS ts ON t_students.s_id = ts.s_id
        where 1=1 
        ${queryData != null && queryData != `` ? `and (t_students.s_id = '${queryData}' or t_students.name = '${queryData}' or t_class.c_name = '${queryData}')`: ``}
        ${totalQueryData!= null && totalQueryData!= ``? `and t_class.group_no = ${totalQueryData}`: ``}
        ORDER BY t_class.c_name ASC, t_class.group_no ASC, t_students.s_id ASC
        LIMIT ${(currentPage - 1) * pageSize}, ${pageSize}`;
    try {
        // 封装查询并执行
        const totalResults = await queryPromise(sqlCount, [], 0);  // 查询总数

        const results = await queryPromise(sqlData, [], 1, currentPage, pageSize);        // 查询数据

        // 如果查询没有返回结果
        if (!results.length) {
            return res.status(404).send('没有数据');
        }
        console.log(results)

        // 查询教师姓名并更新到 results 数组中
        const teacherNamePromises = results.map(item => {
            const tNameSql = `SELECT t_name FROM arrange_course 
                LEFT JOIN t_teacher ON arrange_course.t_id = t_teacher.t_id
                LEFT JOIN t_class ON arrange_course.c_id = t_class.c_id
                WHERE t_class.c_name = ? AND t_class.group_no = ? AND arrange_course.co_id = ?`;

            return queryPromise(tNameSql, [item.c_name, item.group_no, item.co_id], 0)
                .then(tNameResults => {
                    if (tNameResults && tNameResults.length) {
                        item.t_name = tNameResults[0].t_name; // 更新 t_name 字段
                    } else {
                        item.t_name = ''; // 默认值，如果没有查询到教师姓名
                    }
                });
        });

        // 等待所有教师姓名查询完成
        await Promise.all(teacherNamePromises);

        // 发送结果
        res.send({
            total: totalResults[0].count,  // 总数
            data: results             // 表格数据
        });

    } catch (err) {
        console.error('服务器内部错误:', err);
        res.status(500).send('服务器内部错误');
    }
}

const queryPromise = (sql, params, flag, currentPage, pageSize) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            if (flag) {

                // 根据 fields 映射结果数据
                const tableData = results.map((item, index) => {
                    const row = { index: (currentPage - 1) * pageSize + index + 1 };
                    // 将整个 item 的所有字段赋值给 row，同时不覆盖已存在的 index 字段
                    Object.assign(row, item);
                    return row;
                });
                resolve(tableData);
                return;
            }

            resolve(results);
        });
    });
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
