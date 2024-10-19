const express = require('express')
const moment = require('moment')
const db = require('../../2_mysql/index.js')

const router = express.Router()

// 配置每个管理的数据删除功能
const deleteDataFunctions = {
    // 教师管理
    '1': (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.t_id);
            deleteDataToTable('t_teacher', 't_id', deleteId, res)
        } catch (err) {
            console.error(err)
        }
    },
    // 学生管理
    '2': async (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.s_id);
            // 删除分项课程成绩
            await deleteFromTable('course_score', 's_id', deleteId);
            // 删除总成绩
            await deleteFromTable('total_score', 's_id', deleteId);
            // 删除学生信息
            await deleteDataToTable('t_students', 's_id', deleteId, res);
        } catch (err) {
            console.error(err)

        }
    },
    // 班级管理
    '3': (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.c_id);
            deleteDataToTable('t_class', 'c_id', deleteId, res);
        } catch (err) {
            console.error(err)
        }

    },
    // 排课管理
    '4': (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.ac_id);
            const deleteCoNames = deleteData.map(item => item.co_name);
            const deleteGroupNos = deleteData.map(item => item.group_no);
            const deleteClassNames = deleteData.map(item => item.c_name); // t_class 代表班级 ID

            const promises = deleteData.map(async (item, index) => {
                const coName = deleteCoNames[index];
                const groupNo = deleteGroupNos[index];
                const className = deleteClassNames[index];

                const classSql = `SELECT c_id as c_id FROM t_class WHERE c_name = ? AND group_no = ?`;
                const courseSql = `SELECT co_id as co_id FROM t_course WHERE co_name = ?`;

                // 查询t_class的id
                const classPromise = new Promise((resolve, reject) => {
                    db.query(classSql, [className, groupNo], (err, results) => {
                        if (err) return reject(err);
                        if (results.length == 0) return reject({ status: 1 });
                        const c_id = results[0].c_id;
                        resolve(c_id);
                    });
                });

                // 查询t_course的id
                const coursePromise = new Promise((resolve, reject) => {
                    db.query(courseSql, coName, (err, results) => {
                        if (err) return reject(err);
                        if (results.length == 0) return reject({ status: 1 });
                        const co_id = results[0].co_id;
                        resolve(co_id);
                    });
                });

                // 等待 class 和 course id 查询完成
                const [c_id, co_id] = await Promise.all([classPromise, coursePromise]);

                const studentSql = `SELECT s_id FROM t_students 
                    JOIN t_class ON t_students.c_id = t_class.c_id
                    WHERE t_students.c_id = ? AND t_class.group_no = ?`;

                // 查询学生 id
                const studentPromise = new Promise((resolve, reject) => {
                    db.query(studentSql, [c_id, groupNo], (err, results) => {
                        if (err) return reject(err);
                        const s_ids = results.map(item => item.s_id);
                        resolve(s_ids);
                    });
                });

                const s_ids = await studentPromise;

                // 删除学生的分项课程成绩
                const deleteSql = `DELETE FROM course_score WHERE s_id IN (?) AND co_id = ?`;

                return new Promise((resolve, reject) => {
                    db.query(deleteSql, [s_ids, co_id], (err, results) => {
                        if (err) return reject(err);
                        resolve(results.affectedRows);
                    });
                });
            });

            // 等待所有删除操作完成
            Promise.all(promises)
                .then(() => {
                    // 删除排课信息
                    deleteDataToTable('arrange_course', 'ac_id', deleteId, res);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send({ message: '操作失败' });
                });

        } catch (err) {
            console.error(err);
            res.status(500).send({ message: '发生错误' });
        }
    },
    // 周历管理
    '5': (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.w_id);
            deleteDataToTable('t_weekly', 'w_id', deleteId, res);
        } catch (err) {
            console.log(err)
        }
    },
    // 消息管理
    '6': (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.m_id);
            deleteDataToTable('t_message', 'm_id', deleteId, res);
        } catch (err) {
            console.log(err)
        }
    },
    // 成绩管理
    '7': (deleteData, res) => {
        try {
            const deleteId = deleteData.map(item => item.ts_id);
            deleteDataToTable('total_score', 'ts_id', deleteId, res);
        } catch (err) {
            console.log(err)

        }
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

//删除学生的分项课程成绩与总分数
const deleteFromTable = async (table, column, values) => {
    try {
        const placeholders = values.map(() => '?').join(', '); // 创建 SQL 占位符
        const sql = `DELETE FROM ${table} WHERE ${column} IN (${placeholders})`;
        return new Promise((resolve, reject) => {
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error(`从${table}表删除数据时出错:`, err);
                    reject(err);
                } else {
                    console.log(`成功从${table}表删除数据`);
                    resolve(result);
                }
            });
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
