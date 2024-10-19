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
                type: 'text'
            },
            {
                label: '组别',
                prop: 'group_no',
                type: 'number'
            }
        ]
        fetchDataForm('t_students', tableName, req, res, ['t_class'], ['t_students.c_id=t_class.c_id'])
    },
    //班级管理
    '3': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            // {
            //     label: '班级ID',
            //     prop: 'c_id',
            //     type: 'number',
            //     isDisabled: false,
            //     isshow:false
            // },
            {
                label: '班级',
                prop: 'c_name',
                type: 'text'
            },
            {
                label: '组别',
                prop: 'group_no',
                type: 'number'

            }]
        fetchDataForm('t_class', tableName, req, res)
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
                type: 'text'
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
                type: 'text'
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
                isDisabled: true
            },
            {
                label: '备注',
                prop: 'demo',
                type: 'text'
            },
            {
                label: '是否为最后一个环节',
                prop: 'is_last',
                type: 'radio',
                options: [
                    { label: '是', value: 1 },
                    { label: '否', value: 0 }
                ]
            }
        ]
        fetchDataForm('arrange_course', tableName, req, res, ['t_class', 't_teacher', 't_course'], ['arrange_course.c_id=t_class.c_id', 'arrange_course.t_id=t_teacher.t_id', 'arrange_course.co_id=t_course.co_id'])
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
                type: 'text'
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
        fetchDataForm('t_weekly', tableName, req, res)
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
        fetchDataForm('t_message', tableName, req, res)
    },
    //成绩管理
    '7': (req, res) => {
        const tableName = [
            {
                label: '序号',
                prop: 'index'
            },
            // {
            //     label: 'ID',
            //     prop: 'ts_id',
            //     type: 'number',
            //     isDisabled: false,
            //     isshow:false
            // },
            {
                label: '学生姓名',
                prop: 'name',
                type: 'text'
            },
            {
                label: '学号',
                prop: 's_id',
                type: 'number'
            },
            {
                label: '总成绩',
                prop: 'total_score',
                type: 'text'
            },
            {
                label: '实习总结成绩',
                prop: 'summary_score',
                type: 'text'
            },
            {
                label: '所有分项课程所得分',
                prop: 'total_sub_score',
                type: 'text'
            },
            {
                label: '成绩等级',
                prop: 'grade',
                type: 'text'
            },
        ]
        fetchDataForm('total_score', tableName, req, res, ['t_students'], ['total_score.s_id=t_students.s_id'])
    }
}

// 封装一个函数，用于从数据库查询数据并格式化日期字段
const fetchDataForm = async (table, fields, req, res, joinTables = [], joinConditions = []) => {
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
                        if (item.is_last != 0 && (item.is_last != undefined)) {
                            item.is_last = '是'
                        }
                        if (item.is_last == 0 && (item.is_last != undefined)) {
                            item.is_last = '否'
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


//渲染每个管理的数据
router.post('/fetchData', (req, res) => {
    fetchDatas[req.body.index] ? fetchDatas[req.body.index](req, res) : console.log('没有这个操作！')
})



module.exports = router