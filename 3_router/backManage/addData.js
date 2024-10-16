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
        addStudentsMsg(addData, res)
    },
    // 班级管理
    '3': (addData, res) => {
        addDataToTable('t_class', addData, res);
    },
    // 排课管理
    '4': (addData, res) => {
        addArrangeMsg(addData, res)
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
        delete addData.name;
        addDataToTable('total_score', addData, res);
    }
};

// 封装一个通用的函数用于插入数据
const addDataToTable = (table, addData, res) => {
    try {
        const sql = `INSERT INTO ${table} set ?`;

        // 执行插入操作
        db.query(sql, addData, (err, result) => {
            try {
                if (err) {
                    console.error('插入数据时出错:', err);
                    return res.status(500).send({ status: 1 });
                }

                res.send({ message: '数据添加成功', result });
            } catch (err) {
                console.error(err)
            }
        });
    } catch (err) {
        console.log(err)
    }
};

//增加学生信息
function addStudentsMsg(addData, res) {
    try {
        const { name, s_id, c_name, group_no } = addData
        const sql = `select c_id as c_id from t_class where c_name = ? and group_no = ?`
        db.query(sql, [c_name, group_no], (err, results) => {
            try {
                if (err) {
                    console.error('插入数据时出错:', err);
                    return res.status(500).send({ status: 1 });
                }
                if (results.length == 0) {
                    return res.status(500).send({ status: 1 });
                }
                addDataToTable('t_students', { name, s_id, c_id: results[0].c_id }, res);
            } catch (err) {
                console.error(err)
            }
        })
    } catch (err) {
        console.error(err)
    }
}

//增加排课信息
async function addArrangeMsg(addData, res) {
    try {
        const { semester, week, day, section, c_name, t_name, t_id, co_name, demo, is_last } = addData
        const classSql = `select c_id as c_id from t_class where c_name = ?`
        const courseSql = `select co_id as co_id from t_course where co_name = ?`
        //查询t_class的id
        const classPromise = new Promise((resolve, reject) => {
            db.query(classSql, c_name, (err, results) => {
                try {
                    if (err) {
                        console.error('查询数据库出错:', err);
                        return reject({ status: 1 });
                    }
                    if (results.length == 0) {
                        return res.status(500).send({ status: 1 });
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
                        return reject({ status: 1 });
                    }
                    if (results.length == 0) {
                        return res.status(500).send({ status: 1 });
                    }
                    const co_id = results[0].co_id;
                    resolve(co_id);
                } catch (err) {
                    console.error(err)
                }
            });
        });

        const [c_id, co_id] = await Promise.all([classPromise, coursePromise]);
        addDataToTable('arrange_course', { semester, week, day, section, c_id, t_id, co_id, demo, is_last }, res);
    } catch (err) {
        console.error(err)
    }
}

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
