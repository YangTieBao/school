const express = require('express')
const cors = require('cors')

const login_revise_router = require('../3_router/index.js')
const backManage_fetchData_router = require('../3_router/backManage/fetchData.js')
const backManage_addData_router = require('../3_router/backManage/addData.js')
const backManage_editData_router = require('../3_router/backManage/editData.js')
const backManage_deleteData_router = require('../3_router/backManage/deleteData.js')
const backManage_searchData_router = require('../3_router/backManage/searchData.js')

const port = 3000
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(login_revise_router)
app.use(backManage_fetchData_router)
app.use(backManage_addData_router)
app.use(backManage_editData_router)
app.use(backManage_deleteData_router)
app.use(backManage_searchData_router)


app.listen(port, () => {
    console.log(`Server is running at ${port} !`)
})
