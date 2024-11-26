<template>
  <div id="allTable">
    <div class="dialog">
      <el-dialog
        :visible.sync="isOpen"
        :title="add_edit"
        width="40%"
        style="text-align: left"
      >
        <el-form :model="newData" :rules="rules" ref="form">
          <!-- 动态生成表单项 -->
          <el-form-item
            v-for="(item, index) in filteredTableName"
            :key="index"
            :label="item.label"
            :prop="item.prop"
          >
            <!-- 根据type动态生成不同的表单组件 -->
            <template v-if="item.type === 'text' || !item.type">
              <el-input
                v-model="newData[item.prop]"
                style="width: 100%"
                :disabled="item.isDisabled"
                :placeholder="item.placeholder"
              />
            </template>
            <template v-else-if="item.type === 'password'">
              <el-input
                type="password"
                v-model="newData[item.prop]"
                style="width: 100%"
                show-password
              />
            </template>
            <template v-else-if="item.type === 'datetime'">
              <!-- 使用 el-date-picker 选择日期和时间 -->
              <el-date-picker
                v-model="newData[item.prop]"
                type="datetime"
                placeholder="选择日期和时间"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="width: 100%"
              />
            </template>
            <template v-else-if="item.type === 'tel'">
              <el-input
                v-model="newData[item.prop]"
                type="tel"
                maxlength="11"
                style="width: 100%"
              />
            </template>
            <template v-else-if="item.type === 'number'">
              <!-- 使用 el-input-number 组件 -->
              <el-input-number
                v-model="newData[item.prop]"
                :min="0"
                style="width: 100%"
                :disabled="item.isDisabled"
              />
            </template>
            <template v-else-if="item.type === 'radio'">
              <!-- 单选框 -->
              <el-radio-group v-model="newData[item.prop]" style="width: 100%">
                <el-radio
                  v-for="option in item.options"
                  :key="option.value"
                  :label="option.value"
                  >{{ option.label }}</el-radio
                >
              </el-radio-group>
            </template>
            <template v-else-if="item.type === 'select'">
              <el-select
                v-model="newData[item.prop]"
                style="width: 100%"
                :placeholder="item.placeholder"
                :disabled="item.isDisabled"
                filterable
                clearable
              >
                <el-option
                  v-for="option in item.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
            </template>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="handleConfirm(addOrEditUrl)"
            >确认</el-button
          >
        </span>
      </el-dialog>
    </div>
    <div class="right_bottom_top">
      <!-- 查询输入框 -->
      <div class="search">
        <el-input
          v-model="queryData"
          :placeholder="queryCondition"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleClear(1)"
        ></el-input>
        <el-input
          v-model="totalQueryData"
          placeholder="请输入组别"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleClear(2)"
          v-if="this.index == 7"
          style="width: 24rem"
        ></el-input>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">
          查询
        </el-button>
      </div>
      <!-- 添加按钮 -->
      <div class="button">
        <el-button
          type="success"
          @click="triggerFileUpload"
          v-if="index == 2 || index == 4 || index == 6"
        >
          导入
        </el-button>
        <!-- 隐藏的文件输入框 -->
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          style="display: none"
        />
        <el-button type="success" @click="exportDatas" v-if="index == 7">
          导出
        </el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd">
          添加
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="handleDeleteSelected"
        >
          删除
        </el-button>
      </div>
    </div>
    <div class="right_bottom_bottom">
      <div class="table">
        <template>
          <el-table
            ref="multipleTable"
            max-height="450"
            :data="filterTableData"
            border
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              align="center"
              fixed
              :selectable="selectable"
            >
            </el-table-column>
            <el-table-column
              v-for="(item, index) in tableName"
              :key="index"
              :prop="item.prop"
              :label="item.label"
              align="center"
              show-overflow-tooltip
              :formatter="
                (row, column, cellValue, index) => formatCell(item, cellValue)
              "
            >
            </el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              min-width="84"
            >
              <template slot-scope="scope">
                <el-button
                  size="small"
                  type="text"
                  @click="handleEdit(scope.$index, scope.row)"
                  >编辑</el-button
                >
                <el-button
                  v-if="
                    !(
                      $store.state.is_root &&
                      scope.row.t_id == $store.state.userID &&
                      (index == 1 || index === undefined)
                    )
                  "
                  style="color: red"
                  size="small"
                  type="text"
                  @click="handleDelete(scope.$index, scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <div class="pagination">
        <span
          >{{ currentPage }}页/{{
            Math.max(Math.ceil(total / pageSize), 1)
          }}页</span
        >
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          background
          layout="sizes,total, prev, pager, next"
          :total="total"
          @current-change="handleCurrentChange"
          :page-sizes="[10, 20, 30]"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import * as XLSX from "xlsx";
export default {
  props: ["index"],
  data() {
    return {
      currentPage: 1, // 当前页
      pageSize: 10, // 每页显示的数量
      total: 0, // 数据总量
      tableData: [],
      tableName: [],
      multipleSelection: [],
      queryCondition: "请输入工号",
      queryData: "", // 搜索输入框的绑定值
      totalQueryData: "",
      isOpen: false,
      newData: {},
      add_edit: "",
      addOrEditUrl: "",
      fetchFlag: 0,
      searchFlag: 0,
      excelData: [], // 存储从 Excel 导入的数据
      rules: {
        password: [
          { required: true, trigger: "blur" },
          { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
        ],
      },
    };
  },
  components: {},
  watch: {
    "$route.query.index": {
      handler(newIndex) {
        if (newIndex == 1) {
          this.queryCondition = "请输入工号、姓名、电话";
        } else if (newIndex == 2) {
          this.queryCondition = "请输入学号、姓名、班级";
        } else if (newIndex == 3) {
          this.queryCondition = "请输入班级、组别";
        } else if (newIndex == 4) {
          this.queryCondition = "请输入学期、教师工号、周次、班级";
        } else if (newIndex == 5) {
          this.queryCondition = "请输入学期、周次";
        } else if (newIndex == 6) {
          this.queryCondition = "请输入业务名称";
        } else if (newIndex == 7) {
          this.queryCondition = "学号、姓名、班级";
        } else {
          this.queryCondition = "请输入课程名";
        }
      },
      immediate: true,
    },
    // 监听 queryData 变化
    queryData(newValue) {
      if (newValue === "") {
        if (this.totalQueryData || this.queryData) {
          this.searchFlag = 0;
        }
        this.handleSearch(); // 当值为空时重新获取数据
      }
    },
    totalQueryData(newValue) {
      if (newValue === "") {
        if (this.totalQueryData || this.queryData) {
          this.searchFlag = 0;
        }
        this.handleSearch(); // 当值为空时重新获取数据
      }
    },
  },
  computed: {
    filteredTableName() {
      // 过滤掉第一个元素
      let tableName = this.tableName.filter((_, index) => index !== 0);

      // 判断index的值，进行不同的删除操作
      if (this.index == 4) {
        tableName = tableName.filter((item) => item.prop !== "t_name"); // 删除 t_name
      }

      if (this.index == 7) {
        tableName = tableName.filter((item) => item.prop !== "name"); // 删除 name
      }

      return tableName;
    },
    filterTableData() {
      return this.tableData;
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    formatCell(item, cellValue) {
      // 判断字段是否为密码类型
      if (item.prop === "password") {
        // 根据密码长度返回相应数量的 '*'
        return "*".repeat(6);
      }
      // 返回其他字段的原始值
      return cellValue;
    },
    //渲染数据
    fetchData() {
      this.searchFlag = 0;
      this.fetchFlag++;
      if (this.fetchFlag == 1) {
        this.currentPage = 1;
      }
      axios
        .post(this.$global.baseUrl + "/fetchData", {
          index: this.index || "1",
          pageSize: this.pageSize,
          currentPage: this.currentPage,
        })
        .then(
          (res) => {
            console.log("11111111", res.data);
            this.tableName = res.data.tableName;
            this.tableData = res.data.tableData;
            this.total = res.data.total;
            this.initNewData();
          },
          (err) => {
            console.log("Table页面的fetchData发生出错误:", err);
          }
        );
    },
    // 触发文件选择
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    // 处理文件上传并解析Excel文件
    handleFileUpload(event) {
      const file = event.target.files[0];

      if (!file) {
        this.$message({
          message: "请选择一个文件",
          type: "warning",
        });
        return;
      }

      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(file.type)) {
        this.$message({
          message: "请上传 .xlsx 文件",
          type: "warning",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            this.$message({
              message: "Excel 文件中没有工作表",
              type: "error",
            });
            return;
          }

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            this.$message({
              message: "Excel 文件为空",
              type: "error",
            });
            return;
          }

          const [header, ...content] = jsonData;

          if (!header || header.length === 0) {
            this.$message({
              message: "Excel 文件表头为空",
              type: "error",
            });
            return;
          }

          this.excelData = content.map((row) => {
            const obj = {};
            header.forEach((key, index) => {
              let cellValue = row[index] || ""; // 保证每一列都有数据

              if (this.index == 6) {
                // 检查单元格是否为数字（可能是日期/时间）
                if (typeof cellValue === "number") {
                  const cell =
                    worksheet[
                      XLSX.utils.encode_cell({
                        r: content.indexOf(row) + 1,
                        c: index,
                      })
                    ];
                  if (cell && cell.t === "n") {
                    // 使用日期时间格式 "yyyy/mm/dd hh:mm:ss"
                    const dateValue = XLSX.SSF.format(
                      "yyyy/mm/dd hh:mm:ss",
                      cellValue
                    );
                    cellValue = dateValue;
                  }
                }
              }

              obj[key] = cellValue;
            });
            return obj;
          });

          this.uploadExcelData();
        } catch (error) {
          this.$message({
            message: "解析文件时发生错误，请检查文件格式",
            type: "error",
          });
          console.error(error);
        }
      };

      reader.readAsArrayBuffer(file);
      event.target.value = null;
    },
    //将导入的数据传给后端
    uploadExcelData() {
      // 使用axios异步上传数据
      axios
        .post(this.$global.baseUrl + "/addBatchDatas", {
          index: this.index || "1",
          excelData: this.excelData,
        })
        .then((res) => {
          this.fetchData(); // 重新获取数据
          this.$message({
            message: "导入信息成功！",
            type: "success",
          });
        })
        .catch((err) => {
          this.$message({
            message: "导入信息失败！",
            type: "error",
          });
          console.error(err);
        });
    },
    //导出数据
    exportDatas() {
      // 弹出确认框
      this.$confirm("确定要导出数据吗?", "确认操作", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 用户确认操作，执行导出数据
          axios
            .post(this.$global.baseUrl + "/exportDatas", {
              queryData: this.queryData,
              totalQueryData: this.totalQueryData,
            })
            .then((res) => {
              let exportDatas = [];

              res.data.exportDatas.forEach((item, index) => {
                exportDatas[index] = {};
                exportDatas[index]["序号"] = item.index;
                exportDatas[index]["学号"] = item.s_id;
                exportDatas[index]["学生姓名"] = item.name;
                exportDatas[index]["班级"] = item.c_name;
                exportDatas[index]["组别"] = item.group_no;
                exportDatas[index]["所有分项课程所得平均分"] =
                  item.total_sub_score;
                exportDatas[index]["实习总结成绩"] = item.summary_score;
                exportDatas[index]["总成绩"] = item.total_score;
                exportDatas[index]["成绩等级"] = item.grade;
                // exportDatas[index]["教师姓名"] = item.t_name;
              });

              // 创建一个新的工作簿
              const workbook = XLSX.utils.book_new();
              // 将数据转换为表格格式
              const worksheet = XLSX.utils.json_to_sheet(exportDatas);
              // 将表格添加到工作簿
              XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
              // 导出文件
              XLSX.writeFile(workbook, "总成绩.xlsx");

              this.$message({
                message: "导出数据成功！",
                type: "success",
              });
            })
            .catch((err) => {
              this.$message({
                message: "导出数据失败！",
                type: "error",
              });
            });
        })
        .catch(() => {
          // 用户点击取消按钮时的处理
          this.$message({
            message: "操作已取消！",
            type: "info",
          });
        });
    },
    // 根据tableName动态初始化newData
    initNewData() {
      this.newData = {}; // 清空newData
      this.tableName.forEach((item, index) => {
        if (index !== 0) {
          this.$set(this.newData, item.prop, "");
        }
      });
    },
    //增加信息
    handleAdd() {
      if (this.index != 7) {
        this.tableName.forEach((item, index) => {
          if (item.isDisabled) {
            item.isDisabled = false;
          }
        });
      }
      if (this.index == 7) {
        this.tableName.forEach((item, index) => {
          if (item.prop == "s_id") {
            item.isDisabled = false;
          }
          if (item.prop == "summary_score") {
            item.isDisabled = true;
          }
        });
      }
      this.addOrEditUrl = "/addData";
      this.add_edit = "添加信息";
      this.initNewData();
      this.isOpen = true; // 打开添加对话框
    },
    // 处理编辑的逻辑
    handleEdit(tableIndex, row) {
      this.tableName.forEach((item, index) => {
        if (item.isDisabled === false) {
          item.isDisabled = true;
        }
        if (item.prop == "summary_score") {
          item.isDisabled = false;
        }
      });
      this.addOrEditUrl = "/editData";
      const { index, ...newData } = row;
      console.log(newData);
      this.newData = newData;
      this.add_edit = "编辑信息";
      this.isOpen = true; // 打开添加对话框
    },
    // 处理确认的逻辑
    handleConfirm(addOrEditUrl) {
      // 调用 validate 验证表单
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 在发送请求前进行课程名称的检查
          if (
            this.index == 4 &&
            (!this.newData.co_name || this.newData.co_name.trim() === "")
          ) {
            // 提示用户输入课程名称
            this.$message({
              message: "请输入课程！",
              type: "error",
            });
            return; // 阻止代码继续执行
          }
          if (
            this.index == 2 &&
            (!this.newData.group_no || this.newData.c_name.trim() === "")
          ) {
            // 提示用户输入课程名称
            this.$message({
              message: "请输入班级与组！",
              type: "error",
            });
            return; // 阻止代码继续执行
          }
          // 弹出确认框
          this.$confirm("确定要执行添加或编辑操作吗?", "确认操作", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })
            .then(() => {
              // 用户确认操作，执行 axios 请求
              axios
                .post(this.$global.baseUrl + addOrEditUrl, {
                  index: this.index || "1",
                  addOrEditData: this.newData,
                })
                .then((res) => {
                  this.fetchData(); // 重新获取数据
                  this.$message({
                    message: "添加信息或编辑信息成功！",
                    type: "success",
                  });
                  // 验证成功后，发送请求
                  this.isOpen = false;
                })
                .catch((err) => {
                  if (err.response.data.status == 1) {
                    this.$message({
                      message: "添加信息失败！",
                      type: "error",
                    });
                  } else if (err.response.data.status == 2) {
                    this.$message({
                      message: "编辑信息失败！",
                      type: "error",
                    });
                  } else if (err.response.data.status == 3) {
                    this.$message({
                      message: "已有教师带该班级与组的这门课程！",
                      type: "error",
                    });
                  } else if (err.response.data.status == 4) {
                    this.$message({
                      message: "还有分项课程没有完成！",
                      type: "error",
                    });
                  } else {
                    this.$message({
                      message: "操作失败，未知错误。",
                      type: "error",
                    });
                  }
                });
            })
            .catch(() => {
              // 用户点击取消按钮时的处理
              this.$message({
                message: "操作已取消！",
                type: "info",
              });
            });
        } else {
          // 验证失败，提示错误信息
          this.$message({
            message: "请输入至少6位数的密码！",
            type: "error",
          });
          return false; // 阻止提交
        }
      });
    },
    //关闭对话框
    close() {
      this.isOpen = false;
    },
    // 处理单独的删除的逻辑
    handleDelete(tableIndex, row) {
      const deleteData = [];
      deleteData[0] = row;
      this.deleteData("/deleteData", deleteData);
    },
    // 判断是否允许选择某一行
    selectable(row) {
      // 排除 t_id 为 管理员 的行
      return !(
        row.t_id == this.$store.state.userID &&
        (this.index == 1 || this.index === undefined) &&
        this.$store.state.is_root
      );
    },
    // 处理多选框的变化
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 处理删除选中的项
    handleDeleteSelected() {
      const deleteData = this.multipleSelection;
      this.deleteData("/deleteSelectedData", deleteData);
    },
    // 封装删除的逻辑
    deleteData(deleteDataUrl, deleteData) {
      // 弹出确认框
      this.$confirm(
        deleteData.length > 1
          ? "确定要删除这些信息吗?"
          : "确定要删除这条信息吗?",
        "删除确认",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          // 确认删除操作
          axios
            .post(this.$global.baseUrl + deleteDataUrl, {
              index: this.index || "1",
              deleteData,
            })
            .then((res) => {
              this.fetchData(); // 重新获取数据
              this.$message({
                message: "删除信息成功！",
                type: "success",
              });
            })
            .catch((err) => {
              console.error("删除数据失败:", err);
              this.$message({
                message: "删除信息失败！",
                type: "error",
              });
            });
        })
        .catch(() => {
          // 取消删除操作，不做任何处理
          this.$message({
            message: "删除操作已取消！",
            type: "info",
          });
        });
    },
    // 处理查询的逻辑
    handleSearch() {
      if (!this.queryData && !this.totalQueryData) {
        this.fetchData();
        return;
      }
      this.searchFlag++;
      this.fetchFlag = 0;
      if (this.searchFlag == 1) {
        this.currentPage = 1;
      }
      axios
        .post(this.$global.baseUrl + "/queryData", {
          index: this.index || "1",
          queryData: this.queryData,
          totalQueryData: this.totalQueryData,
          pageSize: this.pageSize,
          currentPage: this.currentPage,
        })
        .then((res) => {
          // 给返回的数据加上 index 字段
          const tableDataWithIndex = res.data.data.map((item, i) => ({
            ...item,
            index: (this.currentPage - 1) * this.pageSize + i + 1,
          }));
          this.tableData = tableDataWithIndex;
          this.total = res.data.total; // 更新数据总量
          this.$message({
            message: "查询信息成功！",
            type: "success",
          });
        })
        .catch((err) => {
          this.tableData = [];
          console.error("查询数据失败:", err);
          this.$message({
            message: "查询信息失败！",
            type: "error",
          });
        });
    },
    // 清除查询输入框时的回调
    handleClear(flag) {
      if (flag == 1) {
        this.queryData = "";
      } else {
        this.totalQueryData = "";
      }
      if (this.totalQueryData || this.queryData) {
        this.searchFlag = 0;
      }
      this.handleSearch();
    },
    //分页
    handleCurrentChange(page) {
      this.currentPage = page; // 切换当前页面
      if (this.queryData || this.totalQueryData) {
        this.handleSearch();
      } else {
        this.fetchData();
      }
    },
    handleSizeChange(size) {
      this.pageSize = size; // 切换每页显示数量
      if (this.queryData || this.totalQueryData) {
        this.handleSearch();
      } else {
        this.fetchData();
      }
    },
  },
};
</script>

<style lang="less" scoped>
#allTable {
  height: 100%;
  width: 100%;
  .right_bottom_top {
    box-sizing: border-box;
    width: 100%;
    height: 8%;
    background: #f5f7fa;
    border-bottom: 0.2rem solid lightgrey;
    padding: 0.6rem; /* 增加一点内边距 */
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: space-between;
    .search {
      display: flex;
      width: 40%;
      justify-content: space-around;
      .el-input {
        margin: 0 1rem;
      }
    }
    .button {
      display: flex;
      width: 30%;
      justify-content: space-around;
      .el-button {
        margin-right: 1rem;
      }
    }
  }
  .right_bottom_bottom {
    overflow-x: auto; /* 横向滚动 */
    margin-top: 2%;
    height: 90%;
    width: 100%;
    .pagination {
      display: flex;
      justify-content: right;
      align-items: center;
      margin-top: 0.5rem;
      span {
        padding-right: 0.4rem;
        font-size: 0.8rem;
        color: #515151;
      }
    }
  }
}
</style>