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
        editStudentsMsg(editData, res)
    },
    // 班级管理
    '3': (editData, res) => {
        editDataToTable('t_class', editData, 'c_id', editData.c_id, res);
    },
    // 排课管理
    '4': (editData, res) => {
        editArrangeMsg(editData, res)
    },
    // 周历管理
    '5': (editData, res) => {
        console.log(editData)
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
            try {
                if (err) {
                    console.error('更新数据时出错:', err);
                    return res.status(500).send({ status: 2 });
                }

                res.send({ message: '数据更新成功', result });
            } catch (err) {
                console.error(err)
            }
        });
    } catch (err) {
        console.log(err)
    }
};

//编辑学生的信息
function editStudentsMsg(editData, res) {
    try {
        const { s_id, name, c_name, group_no } = editData
        const sql = `select c_id as c_id from t_class where c_name = ? and group_no = ?`
        db.query(sql, [c_name, group_no], (err, results) => {
            try {
                if (err) {
                    console.error('更新数据时出错:', err);
                    return res.status(500).send({ status: 2 });
                }
                if (results.length == 0) {
                    return res.status(500).send({ status: 2 });
                }
                const c_id = results[0].c_id
                editDataToTable('t_students', { s_id, name, c_id }, 's_id', editData.s_id, res);
            } catch (err) {
                console.error(err)
            }
        })
    } catch (err) {
        console.error(err)
    }
}

//编辑排课信息
async function editArrangeMsg(editData, res) {
    try {
        let { semester, week, day, section, c_name, t_name, t_id, co_name, demo, is_last } = editData
        if (is_last == '是') {
            is_last = 1;
        }
        if (is_last == '否') {
            is_last = 0;
        }
        const classSql = `select c_id as c_id from t_class where c_name = ?`
        const courseSql = `select co_id as co_id from t_course where co_name = ?`
        //查询t_class的id
        const classPromise = new Promise((resolve, reject) => {
            db.query(classSql, c_name, (err, results) => {
                try {
                    if (err) {
                        console.error('查询数据库出错:', err);
                        return reject({ status: 2 });
                    }
                    if (results.length == 0) {
                        return res.status(500).send({ status: 2 });
                    }
                    const c_id = results[0].c_id;
                    resolve(c_id);
                } catch (err) {
                    console.error(err)
                }
            });
        });

        //查询t_course的id
        const coursePromise = new Promise((resolve, reject) => {
            db.query(courseSql, co_name, (err, results) => {
                try {
                    if (err) {
                        console.error('查询数据库出错:', err);
                        return reject({ status: 2 });
                    }
                    if (results.length == 0) {
                        return res.status(500).send({ status: 2 });
                    }
                    const co_id = results[0].co_id;
                    resolve(co_id);
                } catch (err) {
                    console.error(err)
                }
            });
        });

        const [c_id, co_id] = await Promise.all([classPromise, coursePromise]);
        editDataToTable('arrange_course', { semester, week, day, section, c_id, t_id, co_id, demo, is_last }, 'ac_id', editData.ac_id, res);
    } catch (err) {
        console.error(err)
    }
}

// 渲染编辑数据操作的 API
router.post('/editData', (req, res) => {
    try {
        const { index } = req.body;
        const editData = req.body.addOrEditData;
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
