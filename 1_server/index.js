const express = require('express')
const cors = require('cors')

const login_revise_router = require('../3_router/index.js')

const backManage_fetchData_router = require('../3_router/backManage/fetchData.js')
const backManage_addData_router = require('../3_router/backManage/addData.js')
const backManage_editData_router = require('../3_router/backManage/editData.js')
const backManage_deleteData_router = require('../3_router/backManage/deleteData.js')
const backManage_searchData_router = require('../3_router/backManage/searchData.js')

const foreManage_home_router = require('../3_router/foreManage/home.js')

const port = 3000
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//登录与修改密码
app.use(login_revise_router)

//后台管理系统
app.use('/backManage', backManage_fetchData_router)
app.use('/backManage', backManage_addData_router)
app.use('/backManage', backManage_editData_router)
app.use('/backManage', backManage_deleteData_router)
app.use('/backManage', backManage_searchData_router)

//前台系统
app.use('/foreManage', foreManage_home_router)



app.listen(port, () => {
    console.log(`Server is running at ${port} !`)
})
