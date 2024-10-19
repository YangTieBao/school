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
async function addStudentsMsg(addData, res) {
    try {
        const { name, s_id, c_name, group_no } = addData;
        const sql = `SELECT c_id FROM t_class WHERE c_name = ? AND group_no = ?`;

        db.query(sql, [c_name, group_no], async (err, results) => {
            if (err) {
                console.error('查询班级时出错:', err);
                return res.status(500).send({ status: 1, message: '查询班级时发生错误' });
            }
            if (results.length === 0) {
                return res.status(500).send({ status: 1, message: '没有找到对应的班级' });
            }

            const c_id = results[0].c_id;

            try {
                // 插入学生信息
                await addDataToTable('t_students', { name, s_id, c_id }, res);

                // 检查是否已经发送了响应
                if (res.headersSent) {
                    return; // 如果响应已经发送，不再继续操作
                }

                // 创建总成绩记录
                await createTotalScore(s_id);

                // 查询该班级与组是否有课程
                const courseSql = `SELECT co_id FROM arrange_course 
                join t_class on arrange_course.c_id = t_class.c_id
                where arrange_course.c_id =? and t_class.group_no =?`;


                db.query(courseSql, [c_id, group_no], async (err, courses) => {
                    if (err) {
                        console.error('查询课程时出错:', err);
                        return res.status(500).send({ status: 1, message: '查询课程时发生错误' });
                    }

                    // 如果有课程，为每门课程创建分项成绩记录
                    if (courses.length > 0) {
                        const coursePromises = courses.map(course => {
                            return createSubScore({
                                s_id: s_id,
                                co_id: course.co_id,
                                report_score: null,
                                practice_score: null,
                                sub_score: null
                            });
                        });

                        await Promise.all(coursePromises);

                        // 如果所有操作成功且没有发送过响应，发送成功响应
                        if (!res.headersSent) {
                            res.status(200).send({ status: 0, message: '学生信息、总成绩和分项成绩记录插入成功' });
                        }
                    } else {
                        // 如果没有课程，只发送学生和总成绩的成功响应
                        if (!res.headersSent) {
                            res.status(200).send({ status: 0, message: '学生信息和总成绩记录插入成功，但该班级没有课程' });
                        }
                    }
                });
            } catch (err) {
                console.error('插入学生信息或创建总成绩记录时出错:', err);

                // 如果没有发送过响应，发送错误响应
                if (!res.headersSent) {
                    res.status(500).send({ status: 1, message: '插入学生信息或创建总成绩记录时发生错误' });
                }
            }
        });
    } catch (err) {
        console.error('内部错误:', err);

        // 如果没有发送过响应，发送服务器内部错误
        if (!res.headersSent) {
            res.status(500).send({ status: 1, message: '服务器内部错误' });
        }
    }
}

//增加排课信息
async function addArrangeMsg(addData, res) {
    try {
        const { semester, week, day, section, c_name, group_no, t_id, co_name, demo, is_last } = addData
        const classSql = `select c_id as c_id from t_class where c_name = ? and group_no = ?`
        const courseSql = `select co_id as co_id from t_course where co_name = ?`
        //查询t_class的id
        const classPromise = new Promise((resolve, reject) => {
            db.query(classSql, [c_name, group_no], (err, results) => {
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
        await addDataToTable('arrange_course', { semester, week, day, section, c_id, t_id, co_id, demo, is_last }, res);
        await createSubScoresForGroup(c_name, co_id, group_no, res)
    } catch (err) {
        console.error(err)
    }
}

//创建该班级与组的所有学生的分项课程成绩的记录
const createSubScoresForGroup = (c_name, co_id, group_no, res) => {
    try {
        const getStudentsSql = `SELECT t_students.s_id, t_students.name FROM t_students 
                            JOIN t_class ON t_students.c_id = t_class.c_id
                            WHERE t_class.c_name = ? AND t_class.group_no = ?`;

        db.query(getStudentsSql, [c_name, group_no], (err, students) => {
            if (err) {
                console.error('查询学生列表时出错:', err);
                if (!res.headersSent) {
                    return res.status(500).send({ message: '查询学生列表时发生错误' });
                }
                return;
            }

            if (students.length === 0) {
                if (!res.headersSent) {
                    return res.status(404).send({ message: '没有找到该班级和组的学生' });
                }
                return;
            }

            const insertPromises = students.map(student => {
                return checkIfScoreExists(student.s_id, co_id)
                    .then(isExitScore => {
                        if (!isExitScore) {
                            const insertSubScoreData = {
                                s_id: student.s_id,
                                co_id: co_id,
                                report_score: null,
                                practice_score: null,
                                sub_score: null
                            };
                            return createSubScore(insertSubScoreData);
                        } else {
                            return Promise.resolve();  // 如果已经存在记录，跳过创建
                        }
                    })
                    .catch(err => {
                        // 捕获 `checkIfScoreExists` 内部错误
                        console.error('检查成绩记录时出错:', err);
                        return Promise.reject(err);
                    });
            });

            Promise.allSettled(insertPromises)
                .then(results => {
                    // 检查是否有错误
                    const failedResults = results.filter(result => result.status === 'rejected');
                    if (failedResults.length > 0) {
                        console.error('有部分分项成绩创建失败:', failedResults);
                        if (!res.headersSent) {
                            return res.status(500).send({ message: '部分分项成绩创建失败' });
                        }
                        return;
                    }
                    if (!res.headersSent) {
                        res.status(200).send({ message: '所有学生的分项课程记录已成功创建' });
                    }
                })
                .catch(err => {
                    // 捕获 `Promise.allSettled` 中的未处理错误
                    console.error('批量创建记录时出错:', err);
                    if (!res.headersSent) {
                        res.status(500).send({ message: '批量创建记录时发生错误' });
                    }
                });
        });
    } catch (err) {
        console.error(err)

    }
};

// 创建分项成绩记录的方法
const createSubScore = (insertData) => {
    try {
        return new Promise((resolve, reject) => {
            const insertScoreSql = `INSERT INTO course_score SET ?`;
            db.query(insertScoreSql, insertData, (err, result) => {
                if (err) {
                    console.error('插入分项课程成绩记录时出错:', err);
                    reject(new Error('插入分项课程成绩记录时发生错误'));
                } else {
                    resolve(result);
                }
            });
        });
    } catch (err) {
        console.error(err)
    }
};

// 创建总成绩记录的方法
const createTotalScore = (s_id, res) => {
    try {
        return new Promise((resolve, reject) => {
            const insertTotalScoreSql = `INSERT INTO total_score (s_id, total_score, summary_score, grade, total_sub_score) 
                                     VALUES (?, NULL, NULL, NULL, NULL)`;
            db.query(insertTotalScoreSql, [s_id], (err, result) => {
                if (err) {
                    console.error('插入总成绩记录时出错:', err);
                    // Ensure res is only sent once and then reject the promise
                    return reject(new Error('插入总成绩记录时发生错误'));
                }
                resolve(result);
            });
        });
    } catch (err) {
        console.error(err)
    }
};

// 方法：检查分项课程表中是否有该学生的成绩记录
const checkIfScoreExists = (s_id, co_id) => {
    try {
        return new Promise((resolve, reject) => {
            const checkScoreSql = `SELECT * FROM course_score WHERE s_id = ? AND co_id = ?`;
            db.query(checkScoreSql, [s_id, co_id], (err, result) => {
                if (err) {
                    console.error('查询分项课程成绩时出错:', err);
                    return reject(new Error('查询分项课程成绩时发生错误'));
                }

                if (result.length > 0) {
                    // 存在记录，返回 true
                    resolve(true);
                } else {
                    // 不存在记录，返回 false
                    resolve(false);
                }
            });
        });
    } catch (err) {
        console.error(err)
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
