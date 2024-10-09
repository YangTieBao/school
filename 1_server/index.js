const express = require('express')
const cors = require('cors')

const db = require('../2_mysql/index.js')
const router = require('../3_router/index.js')

const port = 3000
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.listen(port, () => {
    console.log(`Server is running at ${port} !`)
})
