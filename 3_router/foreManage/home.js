const express = require('express')
const moment = require('moment')
const db = require('../../2_mysql/index.js')

const router = express.Router()

//渲染课程表
router.post('/fetchCourseData', (req, res) => {
    try {
        const nowDate = moment(new Date()).format('YYYY-MM-DD');
        // 查询当前日期所在的周数
        const weekSql = `SELECT week FROM t_weekly WHERE '${nowDate}' BETWEEN s_time AND e_time`;
        db.query(weekSql, (err, weekResults) => {
            if (err) {
                console.error('查询周数时出错:', err);
                return res.status(500).send('查询周数时发生错误');
            }

            if (weekResults.length === 0) {
                return res.status(404).send('未找到当前日期对应的周数');
            }

            const currentWeek = weekResults[0].week;

            // 查询课程相关数据
            const sql = `
                SELECT 
                    arrange_course.*,
                    t_class.*,
                    t_teacher.*,
                    t_course.*
                FROM 
                    arrange_course
                JOIN 
                    t_class ON arrange_course.c_id = t_class.c_id
                JOIN 
                    t_teacher ON arrange_course.t_id = t_teacher.t_id
                JOIN 
                    t_course ON arrange_course.co_id = t_course.co_id
                WHERE 
                    arrange_course.week = '${currentWeek}'
            `;
            db.query(sql, (err, results) => {
                if (err) {
                    console.error('查询数据时出错:', err);
                    return res.status(500).send('查询数据时发生错误');
                }
                res.send({ fetchCourseData: results });
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器内部错误');
    }
});

//查询课程表
router.post('/searchCourseData', (req, res) => {
    try {
        const { semester, week, t_id } = req.body
        const sql = `
                SELECT *
                FROM 
                    arrange_course
                JOIN 
                    t_class ON arrange_course.c_id = t_class.c_id
                JOIN 
                    t_teacher ON arrange_course.t_id = t_teacher.t_id
                JOIN 
                    t_course ON arrange_course.co_id = t_course.co_id
                WHERE 
                    1 = 1
                    ${semester != null && semester != '' ? `and arrange_course.semester = '${semester}'` : ``}
                    ${week != null && week != '' ? `and arrange_course.week = ${week}` : ``} 
                    ${t_id != null && t_id != '' ? `and arrange_course.t_id = ${t_id}` : ``} 
            `;
        db.query(sql, (err, results) => {
            if (err) {
                console.error('查询数据时出错:', err);
                return res.status(500).send('查询数据时发生错误');
            }
            res.send({ searchCourseData: results });
        })
    } catch (err) {
        console.error(err)
    }
})

//获取消息数据
router.post('/getNoticeData', (req, res) => {
    try {
        const { flag } = req.body
        const sql = `select * from t_message order by m_id desc ${flag ? `limit 3` : ''}`
        db.query(sql, (err, results) => {
            if (err) {
                console.error('查询数据时出错:', err);
                return res.status(500).send('查询消息数据时发生错误');
            }
            res.send({ getNoticeData: results });
        })

    } catch (err) {
        console.error(err)
    }
})

//根据当前时间获取周次与学期
router.post('/getWeek_semester', (req, res) => {
    try {
        const nowDate = moment(new Date()).format('YYYY-MM-DD');
        // 查询当前日期所在的周数
        const weekSql = `SELECT week,semester FROM t_weekly WHERE '${nowDate}' BETWEEN s_time AND e_time`;
        db.query(weekSql, (err, weekResults) => {
            if (err) {
                console.error('查询周数时出错:', err);
                return res.status(500).send('查询周数时发生错误');
            }

            if (weekResults.length === 0) {
                return res.status(404).send('未找到当前日期对应的周数与学期');
            }

            const currentWeek = weekResults[0].week;
            const currentSemester = weekResults[0].semester;
            res.send({ currentSemester, currentWeek })
        })
    } catch (err) {
        console.log(err)
    }
})

//渲染学生数据
router.post('/fetchStudentsData', (req, res) => {
    try {
        const { c_name, group_no, co_id } = req.body
        // const c_name = "软件工程2201班", group_no = 1,co_id = 3
        checkCoursesCompletion(c_name, group_no, co_id, (err, isshow) => {
            if (err) {
                console.error('查询课程完成状态时出错:', err);
                return res.status(500).send('查询课程完成状态时发生错误');
            }
            // 使用 LEFT JOIN 代替 JOIN
            const sql = `SELECT *,t_students.s_id AS s_id
        FROM 
            t_students
        LEFT JOIN 
            t_class ON t_students.c_id = t_class.c_id
        LEFT JOIN 
            course_score AS cs ON t_students.s_id = cs.s_id
        LEFT JOIN 
            total_score AS ts ON t_students.s_id = ts.s_id
        WHERE 
            t_class.c_name = ? AND 
            t_class.group_no = ?
        `;

            db.query(sql, [c_name, group_no], (err, results) => {
                if (err) {
                    console.error('查询数据时出错:', err);
                    return res.status(500).send('查询学生数据时发生错误');
                }

                // 返回结果
                res.send({ fetchStudentsData: results, isshow });
            });
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器内部错误');
    }
});

//获取班级
router.post('/getClassData', (req, res) => {
    try {
        const { t_id, co_name } = req.body
        // const t_id = 1, co_name = "JAVA"

        const sql = `select t_class.c_name as c_name from arrange_course
        join t_class on arrange_course.c_id = t_class.c_id
        join t_teacher on arrange_course.t_id = t_teacher.t_id
        join t_course on arrange_course.co_id = t_course.co_id
        where t_teacher.t_id = ? and t_course.co_name = ?`

        db.query(sql, [t_id, co_name], (err, results) => {
            if (err) {
                console.error('查询数据时出错:', err);
                return res.status(500).send('查询班级数据时发生错误');
            }
            if (results.length == 0) return res.send({ getClassData: [] })
            // 使用 map() 方法从每个结果对象中提取 c_name 字段
            const classNames = results.map(item => item.c_name);
            res.send({ getClassData: classNames });
        })
    } catch (err) {
        console.error(err)
    }
})

//获取班级下的学生数据
router.post('/getStudenstData', (req, res) => {
    try {
        const { c_name } = req.body
        // const c_name = "软件工程2201班"
        const sql = `SELECT *,t_students.s_id AS s_id
                FROM 
                    t_students
                LEFT JOIN 
                    t_class ON t_students.c_id = t_class.c_id
                LEFT JOIN 
                    course_score AS cs ON t_students.s_id = cs.s_id
                LEFT JOIN 
                    total_score AS ts ON t_students.s_id = ts.s_id
                WHERE 
                    t_class.c_name = ?
                `
        db.query(sql, [c_name], (err, results) => {
            if (err) {
                console.error('查询数据时出错:', err);
                return res.status(500).send('查询学生数据时发生错误');
            }
            res.send({ getStudentsData: results });
        })
    } catch (err) {
        console.error(err)
    }

})

//跟新学生分项成绩
router.post('/updateScore', async (req, res) => {
    try {
        const { s_id, group_no, co_id, report_score, practice_score, c_name } = req.body;

        // 计算 sub_score 的成绩
        const sub_score = report_score * 0.2 + practice_score * 0.8;

        // 将插入或更新数据封装
        const insertData = {
            s_id,
            co_id,
            report_score,
            practice_score,
            sub_score
        };

        // 先查询是否有该学生的记录
        const existingScore = await checkIfScoreExists(s_id, co_id, res);
        const existingTotalScore = await checkIfTotalScoreExists(s_id, res);

        if (!existingScore) {
            // 如果不存在记录，插入分项课程成绩
            await createSubScore(insertData, res);
        } else {
            // 如果存在记录，更新分项课程成绩
            await updateSubScore(insertData, res);
        }

        if (!existingTotalScore) {
            await createTotalScore(s_id, res);
        }

        // 检查该课程下所有学生的成绩是否已完成
        const allScoresComplete = await checkAllStudentsScore(co_id, c_name, group_no, res);

        res.send({ message: '跟新成功！' })

    } catch (err) {
        console.error('服务器内部错误:', err);
        res.status(500).send({ message: '服务器内部错误', error: err });
    }
});

//跟新学生总成绩
router.post('/updateTotalScore', (req, res) => {
    try {
        const { s_id, summary_score, c_name, group_no, co_id, } = req.body;
        // const c_name = "软件工程2201班", group_no = 1, co_id = 3, s_id = 2021, summary_score = 70
        checkCoursesCompletion(c_name, group_no, co_id, async (err, isshow) => {
            if (err) {
                console.error('查询课程完成状态时出错:', err);
                return res.status(500).send('查询课程完成状态时发生错误');
            }
            if (isshow) {
                try {
                    const total_sub_score = await getAverageScoreForStudent(s_id, res);
                    const total_score = summary_score * 0.05 + total_sub_score * 0.95;
                    const grade = (total_score) => {
                        if (total_score >= 90) {
                            return '优秀';      // 90-100
                        } else if (total_score >= 80) {
                            return '良好';      // 80-89
                        } else if (total_score >= 70) {
                            return '中等';      // 70-79
                        } else if (total_score >= 60) {
                            return '及格';      // 60-69
                        } else {
                            return '不及格';    // 0-59
                        }
                    };

                    const final_grade = grade(total_score); // 计算学生的等级


                    // 更新总成绩和等级到数据库
                    const updateSql = `UPDATE total_score SET summary_score = ?, total_score = ?, grade = ?,total_sub_score=? WHERE s_id = ?`;
                    db.query(updateSql, [summary_score, total_score, final_grade, total_sub_score, s_id], (err, result) => {
                        if (err) {
                            console.error('更新总成绩和等级时出错:', err);
                            res.status(500).send({ message: '更新总成绩时发生错误', error: err });
                            return;
                        }

                        // 成功更新，返回响应
                        res.send({ message: '总成绩和等级已成功更新', total_score, grade: final_grade });
                    });
                } catch (err) {
                    console.error(err)
                }
            } else {
                res.status(500).send('该学生还有其它分项课程成绩没完成');
            }
        })

    } catch (err) {
        console.error(err)
    }
})

// 方法：检查分项课程表中是否有该学生的成绩记录
const checkIfScoreExists = (s_id, co_id, res) => {
    try {
        return new Promise((resolve, reject) => {
            const checkScoreSql = `SELECT * FROM course_score WHERE s_id = ? AND co_id = ?`;
            db.query(checkScoreSql, [s_id, co_id], (err, result) => {
                if (err) {
                    console.error('查询分项课程成绩时出错:', err);
                    res.status(500).send({ message: '查询分项课程成绩时发生错误', error: err });
                    return reject(err);
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

// 方法：检查总成绩表中是否有该学生的成绩记录
const checkIfTotalScoreExists = (s_id, res) => {
    try {
        return new Promise((resolve, reject) => {
            const checkScoreSql = `SELECT * FROM total_score WHERE s_id = ?`;
            db.query(checkScoreSql, [s_id], (err, result) => {
                if (err) {
                    console.error('查询总成绩时出错:', err);
                    res.status(500).send({ message: '查询总成绩时发生错误', error: err });
                    return reject(err);
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

// 方法：创建分项课程成绩
const createSubScore = (insertData, res) => {
    try {
        return new Promise((resolve, reject) => {
            const insertScoreSql = `INSERT INTO course_score SET ?`;
            db.query(insertScoreSql, insertData, (err, result) => {
                if (err) {
                    console.error('插入分项课程成绩时出错:', err);
                    res.status(500).send({ message: '插入分项课程成绩时发生错误', error: err });
                    return reject(err);
                }
                resolve(result);
            });
        });
    } catch (err) {
        console.error(err)
    }
};

// 方法：创建总成绩表记录
const createTotalScore = (s_id, res) => {
    return new Promise((resolve, reject) => {
        const insertTotalScoreSql = `INSERT INTO total_score (s_id, total_score, summary_score, grade, total_sub_score) 
                                     VALUES (?, NULL, NULL, NULL, NULL)`;
        db.query(insertTotalScoreSql, [s_id], (err, result) => {
            if (err) {
                console.error('插入总成绩时出错:', err);
                res.status(500).send({ message: '插入总成绩时发生错误', error: err });
                return reject(err);
            }
            resolve(result);
        });
    });
};

// 方法：更新分项课程成绩
const updateSubScore = (insertData, res) => {
    try {
        return new Promise((resolve, reject) => {
            const updateScoreSql = `UPDATE course_score SET report_score = ?, practice_score = ?, sub_score = ?
                                    WHERE s_id = ? AND co_id = ?`;
            const { report_score, practice_score, sub_score, s_id, co_id } = insertData;
            db.query(updateScoreSql, [report_score, practice_score, sub_score, s_id, co_id], (err, result) => {
                if (err) {
                    console.error('更新分项课程成绩时出错:', err);
                    res.status(500).send({ message: '更新分项课程成绩时发生错误', error: err });
                    return reject(err);
                }
                resolve(result);
            });
        });
    } catch (err) {
        console.error(err)
    }
};

// 方法：检查所有学生是否都已打分
const checkAllStudentsScore = (co_id, c_name, group_no, res) => {
    try {
        return new Promise((resolve, reject) => {
            const searchStuSql = `SELECT course_score.report_score, course_score.practice_score
                                  FROM t_students
                                  JOIN t_class ON t_students.c_id = t_class.c_id
                                  LEFT JOIN course_score ON t_students.s_id = course_score.s_id AND course_score.co_id = ?
                                  WHERE t_class.c_name = ? AND t_class.group_no = ?`;

            db.query(searchStuSql, [co_id, c_name, group_no], (err, studentsScores) => {
                if (err) {
                    console.error('查询学生分数时出错:', err);
                    res.status(500).send({ message: '查询学生分数时发生错误', error: err });
                    return reject(err);
                }
                try {
                    // 检查是否所有学生都已打分
                    const allScoresSet = studentsScores.every(student => student.report_score != null && student.practice_score != null);

                    if (allScoresSet) {
                        // 如果所有学生都已打分，更新课程的 is_last 为 1
                        const updateIsLastSql = `UPDATE arrange_course SET is_last = 1 WHERE co_id = ?`;
                        db.query(updateIsLastSql, [co_id], (updateIsLastErr, updateIsLastResult) => {
                            if (updateIsLastErr) {
                                console.error('更新课程 is_last 时出错:', updateIsLastErr);
                                res.status(500).send({ message: '更新课程状态时发生错误', error: updateIsLastErr });
                                return reject(updateIsLastErr);
                            }
                            resolve(true); // 返回 true，表示所有学生都已打分
                        });
                    } else {
                        resolve(false); // 返回 false，表示并非所有学生都已打分
                    }
                } catch (err) {
                    console.errror(err)
                }
            });
        });
    } catch (err) {
        console.error(err)
    }
};

// 方法：计算该学生的所有分项课程成绩的平均值
const getAverageScoreForStudent = (s_id, res) => {
    try {
        return new Promise((resolve, reject) => {
            const getScoresSql = `SELECT sub_score 
                                  FROM course_score 
                                  WHERE s_id = ?`;

            db.query(getScoresSql, [s_id], (err, results) => {
                if (err) {
                    console.error('查询分项课程成绩时出错:', err);
                    res.status(500).send({ message: '查询分项课程成绩时发生错误', error: err });
                    return reject(err);
                }

                // 计算所有分项课程成绩的平均值
                if (results.length > 0) {
                    const totalScore = results.reduce((sum, course) => {
                        return sum + (course.sub_score || 0);  // 如果成绩为空，则视为 0
                    }, 0);
                    const averageScore = totalScore / results.length;

                    resolve(averageScore);
                } else {
                    resolve(0);  // 如果没有成绩，返回 0 作为平均值
                }
            });
        });
    } catch (err) {
        console.error(err)
    }
};

//判断is_last,检查课程完成情况
function checkCoursesCompletion(c_name, group_no, current_co_id, callback) {
    try {
        const searchSql = `SELECT ac.co_id, ac.is_last
        FROM arrange_course AS ac
        JOIN t_class AS tc ON ac.c_id = tc.c_id
        WHERE tc.c_name = ? AND tc.group_no = ?`

        db.query(searchSql, [c_name, group_no], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            // 确认除当前课程外，所有课程的 is_last 都为 1
            const isshow = results.filter(course => course.co_id !== current_co_id)
                .every(course => course.is_last === 1);
            callback(null, isshow);
        });
    } catch (err) {
        console.error(err)
    }
}




module.exports = router