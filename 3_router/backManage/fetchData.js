const express = require('express')
const moment = require('moment')
const db = require('../../2_mysql/index.js')

const router = express.Router()


//配置每个管理的数据
const fetchDatas = {
    //教师管理
    '1': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            {
                label: '姓名',
                prop: 't_name',
                type: 'text'
            },
            {
                label: '工号',
                prop: 't_id',
                type: 'number',
                isDisabled: false,
                isshow: true
            },
            {
                label: '电话',
                prop: 'phone',
                type: 'tel'
            },
            {
                label: '密码',
                prop: 'password',
                type: 'password'
            }]
        fetchDataForm('t_teacher', tableName, req, res)
    },
    //学生管理
    '2': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            {
                label: '姓名',
                prop: 'name',
                type: 'text'
            },
            {
                label: '学号',
                prop: 's_id',
                type: 'number',
                isDisabled: false,
                isshow: true
            },
            {
                label: '班级',
                prop: 'c_name',
                type: 'text',
                placeholder: '请输入班级名称(软件工程2201班)'
            },
            {
                label: '组别',
                prop: 'group_no',
                type: 'number'
            }
        ]
        fetchDataForm('t_students', tableName, req, res, 't_class.c_name asc,t_class.group_no asc', ['t_class'], ['t_students.c_id=t_class.c_id'])
    },
    //班级管理
    '3': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            {
                label: '班级',
                prop: 'c_name',
                type: 'text',
                placeholder: '请输入班级名称(软件工程2201班)'
            },
            {
                label: '组别',
                prop: 'group_no',
                type: 'number'

            }]
        fetchDataForm('t_class', tableName, req, res, 't_class.c_name asc,t_class.group_no asc')
    },
    //排课管理
    '4': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            // {
            //     label: 'ID',
            //     prop: 'ac_id',
            //     type: 'number',
            //     isDisabled: false,
            //     isshow:false
            // },
            {
                label: '学期',
                prop: 'semester',
                type: 'text',
                placeholder: '请输入班学期(2023-2024-1)'
            },
            {
                label: '周次',
                prop: 'week',
                type: 'number'
            },
            {
                label: '星期',
                prop: 'day',
                type: 'number'
            },
            {
                label: '节次',
                prop: 'section',
                type: 'number'
            },
            {
                label: '班级',
                prop: 'c_name',
                type: 'text',
                placeholder: '请输入班级名称(软件工程2201班)'
            },
            {
                label: '组别',
                prop: 'group_no',
                type: 'number'
            },
            {
                label: '教师工号',
                prop: 't_id',
                type: 'number'
            },
            {
                label: '教师姓名',
                prop: 't_name',
                type: 'text'
            },
            {
                label: '课程名',
                prop: 'co_name',
                type: 'text',
                isDisabled: true,
                placeholder: '请输入课程名称(JAVA、C++等))'
            },
            {
                label: '备注',
                prop: 'demo',
                type: 'text'
            }
        ]
        fetchDataForm('arrange_course', tableName, req, res, 't_class.c_name asc,t_class.group_no asc', ['t_class', 't_teacher', 't_course'], ['arrange_course.c_id=t_class.c_id', 'arrange_course.t_id=t_teacher.t_id', 'arrange_course.co_id=t_course.co_id'])
    },
    //周历管理
    '5': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            // {
            //     label: 'ID',
            //     prop: 'w_id',
            //     type: 'number',
            //     isDisabled: false,
            //     isshow:false
            // },
            {
                label: '学期',
                prop: 'semester',
                type: 'text',
                placeholder: '请输入班学期(2023-2024-1)'
            },
            {
                label: '周次',
                prop: 'week',
                type: 'number'
            },
            {
                label: '起始时间',
                prop: 's_time',
                type: 'datetime'

            },
            {
                label: '终止时间',
                prop: 'e_time',
                type: 'datetime'
            },
            {
                label: '备注',
                prop: 'demo',
                type: 'text'
            }
        ]
        fetchDataForm('t_weekly', tableName, req, res, 's_time asc')
    },
    //消息管理
    '6': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            // {
            //     label: '消息ID',
            //     prop: 'm_id',
            //     type: 'number',
            //     isDisabled: false,
            //     isshow:false
            // },
            {
                label: '业务名称',
                prop: 'm_name',
                type: 'text'
            },
            {
                label: '内容',
                prop: 'content',
                type: 'text'
            },
            {
                label: '推送时间',
                prop: 's_time',
                type: 'datetime'
            }
        ]
        fetchDataForm('t_message', tableName, req, res, 's_time desc')
    },
    //成绩管理
    '7': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            {
                label: '学号',
                prop: 's_id',
                type: 'number',
                isDisabled: true
            },
            {
                label: '学生姓名',
                prop: 'name',
                type: 'text',
                isDisabled: true
            },
            {
                label: '班级',
                prop: 'c_name',
                type: 'text',
                isDisabled: true
            },
            {
                label: '组别',
                prop: 'group_no',
                type: 'number',
                isDisabled: true
            },
            {
                label: '总成绩',
                prop: 'total_score',
                type: 'text',
                isDisabled: true
            },
            {
                label: '实习总结成绩',
                prop: 'summary_score',
                type: 'text'
            },
            {
                label: '所有分项课程所得分',
                prop: 'total_sub_score',
                type: 'text',
                isDisabled: true
            },
            {
                label: '成绩等级',
                prop: 'grade',
                type: 'text',
                isDisabled: true

            },
            {
                label: '教师姓名',
                prop: 't_name',
                type: 'text',
                isDisabled: true
            },
        ]
        fetchTotalScore(req, res, tableName)
        // fetchDataForm('total_score', tableName, req, res, ['t_students'], ['total_score.s_id=t_students.s_id'])
    },
    //课程管理
    '8': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            {
                label: '课程名称',
                prop: 'co_name',
                type: 'text',
                placeholder: '请输入课程名称(JAVA、C++等))',

            }]
        fetchDataForm('t_course', tableName, req, res)
    },
}

// 封装一个函数，用于从数据库查询数据并格式化日期字段
const fetchDataForm = async (table, fields, req, res, order = '', joinTables = [], joinConditions = []) => {
    try {
        const { pageSize, currentPage } = req.body;

        // 构建基础的查询 SQL 语句
        let sqlCount = `SELECT COUNT(*) as count FROM ${table}`;
        let sqlData = `SELECT * FROM ${table}`;

        // 如果传入了联合查询的表和条件，遍历并构建 JOIN 语句
        if (joinTables.length > 0 && joinConditions.length > 0) {
            joinTables.forEach((joinTable, index) => {
                sqlCount += ` JOIN ${joinTable} ON ${joinConditions[index]}`;
                sqlData += ` JOIN ${joinTable} ON ${joinConditions[index]}`;
            });
        }

        if (order != '') {
            // 是按照什么字段排序
            sqlData += ` order by ` + order;
        }


        // 加入分页的 LIMIT 语句
        sqlData += ` LIMIT ${(currentPage - 1) * pageSize},${pageSize}`;

        // 查询总数
        const totalPromise = new Promise((resolve, reject) => {
            db.query(sqlCount, (err, results) => {
                try {
                    if (err) {
                        console.error('查询数据库出错:', err);
                        return reject('数据库查询错误');
                    }
                    const total = results[0].count;
                    resolve(total);
                } catch (err) {
                    console.error(err)
                }
            });
        });

        // 查询数据
        const dataPromise = new Promise((resolve, reject) => {
            db.query(sqlData, (err, results) => {
                try {
                    if (err) {
                        console.error('查询数据库出错:', err);
                        return reject('数据库查询错误');
                    }


                    // 格式化日期字段
                    results.forEach(item => {
                        if (item.s_time) {
                            item.s_time = moment(item.s_time).format('YYYY-MM-DD HH:mm:ss');
                        }
                        if (item.e_time) {
                            item.e_time = moment(item.e_time).format('YYYY-MM-DD HH:mm:ss');
                        }
                    });


                    // 根据 fields 映射结果数据
                    const tableData = results.map((item, index) => {
                        const row = { index: (currentPage - 1) * pageSize + index + 1 };
                        // 将整个 item 的所有字段赋值给 row，同时不覆盖已存在的 index 字段
                        Object.assign(row, item);
                        return row;
                    });

                    resolve(tableData);
                } catch (err) {
                    console.error(err)
                }
            });
        });


        // 等待两个 Promise 都完成
        const [total, tableData] = await Promise.all([totalPromise, dataPromise]);

        // 返回结果给前端
        res.send({
            total,       // 总数
            tableName: fields, // 字段名
            tableData    // 表格数据
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器内部错误');
    }
};

// 渲染总成绩表
async function fetchTotalScore(req, res, fields) {
    const { pageSize, currentPage } = req.body;

    // SQL 查询语句
    let sqlCount = `SELECT COUNT(*) as count FROM total_score`;
    let sqlData = `
        SELECT t_students.s_id as s_id, t_students.name, t_class.c_name, t_class.group_no, cs.*, ts.*
        FROM t_students
        LEFT JOIN t_class ON t_students.c_id = t_class.c_id
        LEFT JOIN course_score AS cs ON t_students.s_id = cs.s_id
        JOIN total_score AS ts ON t_students.s_id = ts.s_id
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
            tableName: fields,             // 字段名
            tableData: results             // 表格数据
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


//渲染每个管理的数据
router.post('/fetchData', (req, res) => {
    fetchDatas[req.body.index] ? fetchDatas[req.body.index](req, res) : console.log('没有这个操作！')
})


module.exports = router