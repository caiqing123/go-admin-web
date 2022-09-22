
<template>
  <div>
    <BasicLayout>
      <template #wrapper>
        <el-card class="box-card">
          <el-form ref="queryForm" :model="queryParams" :inline="true" label-position="left" label-width="68px">
            <el-form-item label="名称" prop="job_name">
              <el-input
                v-model="queryParams.job_name"
                placeholder="请输入名称"
                clearable
                size="small"
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item label="任务分组" prop="job_group">
              <el-select
                v-model="queryParams.job_group"
                placeholder="定时任务任务分组"
                clearable
                size="small"
              >
                <el-option
                  v-for="dict in jobGroupOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="定时任务状态"
                clearable
                size="small"
              >
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                v-permisaction="['job:sysJob:add']"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd"
              >新增
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['job:sysJob:edit']"
                type="success"
                icon="el-icon-edit"
                size="mini"
                :disabled="single"
                @click="handleUpdate"
              >修改
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['job:sysJob:remove']"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
              >删除
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                v-permisaction="['job:sysJob:log']"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleLog"
              >日志
              </el-button>

            </el-col>
          </el-row>

          <el-table v-loading="loading" :data="sysjobList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column
              label="编码"
              align="center"
              prop="job_id"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="名称"
              align="center"
              prop="job_name"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="任务分组"
              align="center"
              prop="job_group"
              :formatter="jobGroupFormat"
              width="100"
            >
              <template slot-scope="scope">
                {{ jobGroupFormat(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column
              label="cron表达式"
              align="center"
              prop="cron_expression"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="调用目标"
              align="center"
              prop="invoke_target"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="状态"
              align="center"
              prop="status"
              :formatter="statusFormat"
              width="100"
            >
              <template slot-scope="scope">
                {{ statusFormat(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  v-permisaction="['job:sysJob:edit']"
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleUpdate(scope.row)"
                >修改
                </el-button>
                <el-button
                  v-if="scope.row.entry_id!==0"
                  v-permisaction="['job:sysJob:remove']"
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleRemove(scope.row)"
                >停止
                </el-button>
                <el-button
                  v-if="scope.row.entry_id==0"
                  v-permisaction="['job:sysJob:start']"
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleStart(scope.row)"
                >启动
                </el-button>
                <el-button
                  v-permisaction="['job:sysJob:remove']"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.row)"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.page"
            :limit.sync="queryParams.per_page"
            @pagination="getList"
          />

          <!-- 添加或修改对话框 -->
          <el-dialog v-dialogDrag :title="title" :visible.sync="open" width="80%" append-to-body>
            <el-form ref="form" :model="form" :rules="rules">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="名称" prop="job_name">
                    <el-input
                      v-model="form.job_name"
                      placeholder="名称"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="任务分组" prop="job_group">
                    <el-select
                      v-model="form.job_group"
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="dict in jobGroupOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="调用目标" prop="invoke_target">
                    <span slot="label">
                      调用目标
                      <el-tooltip placement="top">
                        <div slot="content">
                          函数 调用示例：func (t *EXEC) ExamplesNoParam(){..} 填写 ExamplesNoParam 即可；
                          <br>参数说明：目前不支持带参调用
                          接口 示例：http://localhost:8000
                        </div>
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input
                      v-model="form.invoke_target"
                      placeholder="调用目标"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="目标参数" prop="args">
                    <span slot="label">
                      目标参数
                      <el-tooltip placement="top">
                        <div slot="content">
                          参数示例：有参：请以string格式填写；无参：为空；
                          <br>参数说明：目前仅支持函数调用
                        </div>
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input
                      v-model="form.args"
                      placeholder="目标参数"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="cron表达式" prop="cron_expression">
                    <el-input
                      v-model="form.cron_expression"
                      clearable
                      placeholder="请输入Cron表达式"
                    >
                      <template slot="append">
                        <el-popover v-model="cronPopover" placement="top" width="700">
                          <cron v-show="cronPopover" v-model="cronExpression" />
                          <div style="text-align: center; margin: 0">
                            <el-button type="primary" size="medium" @click="changeCron">确定</el-button>
                            <el-button type="warning" size="medium" @click="cronPopover = false">取消</el-button>
                          </div>
                          <el-button v-show="cronEdis" slot="reference">编辑</el-button>
                        </el-popover>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="是否并发" prop="concurrent">
                    <el-radio-group v-model="form.concurrent" size="small">
                      <el-radio-button label="0">允许</el-radio-button>
                      <el-radio-button label="1">禁止</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="调用类型" prop="job_type">
                    <el-radio-group v-model="form.job_type" size="small">
                      <el-radio-button label="1">接口</el-radio-button>
                      <el-radio-button label="2">函数</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>

                <el-col :span="24">
                  <el-form-item label="执行策略" prop="misfire_policy">
                    <el-radio-group v-model="form.misfire_policy" size="small">
                      <el-radio-button label="1">立即执行</el-radio-button>
                      <el-radio-button label="2">等待启动</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态" prop="status">
                    <el-select
                      v-model="form.status"
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="dict in statusOptions"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </el-dialog>

        </el-card>
      </template>
    </BasicLayout>
  </div>
</template>

<script>
import { addSysJob, delSysJob, getSysJob, listSysJob, updateSysJob, removeJob, startJob } from '@/api/job/sys-job'
import cron from '@/components/Cron/cron'

export default {
  name: 'SysJobManage',
  components: {
    cron
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      id: 0,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      sysjobList: [],
      jobGroupOptions: [],
      statusOptions: [],
      // 查询参数
      queryParams: {
        page: 1,
        per_page: 10,
        job_name: undefined,
        job_group: undefined,
        status: undefined

      },
      // 表单参数
      form: {

      },
      // 表单校验
      rules: {
        job_id: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        job_name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        job_group: [{ required: true, message: '任务分组不能为空', trigger: 'blur' }],
        cron_expression: [{ required: true, message: 'cron表达式不能为空', trigger: 'blur' }],
        invoke_target: [{ required: true, message: '调用目标不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      },
      cronPopover: false,
      cronEdis: true,
      cronExpression: ''
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_job_group').then(response => {
      this.jobGroupOptions = response.data
    })

    this.getDicts('sys_job_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listSysJob(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sysjobList = response.data
        this.total = response.pager.TotalCount
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        job_id: undefined,
        job_name: undefined,
        job_group: undefined,
        cron_expression: undefined,
        invoke_target: undefined,
        args: undefined,
        misfire_policy: 1,
        concurrent: 1,
        job_type: 1,
        status: undefined
      }
      this.resetForm('form')
      this.cronEdis = true
    },
    jobGroupFormat(row) {
      return this.selectDictLabel(this.jobGroupOptions, row.job_group)
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加定时任务'
      this.isEdit = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.job_id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const job_id = row.job_id || this.ids
      getSysJob(job_id).then(response => {
        this.form = response.data
        this.form.status = String(this.form.status)
        this.form.misfire_policy = String(this.form.misfire_policy)
        this.form.concurrent = String(this.form.concurrent)
        this.form.job_type = String(this.form.job_type)
        this.open = true
        this.title = '修改定时任务'
        this.isEdit = true
        this.cronExpression = this.form.cron_expression
        if (this.cronExpression.indexOf('@') !== -1) {
          this.cronEdis = false
        }
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.job_id !== undefined) {
            this.form.status = parseInt(this.form.status)
            this.form.misfire_policy = parseInt(this.form.misfire_policy)
            this.form.concurrent = parseInt(this.form.concurrent)
            this.form.job_type = parseInt(this.form.job_type)
            updateSysJob(this.form).then(response => {
              this.msgSuccess(response.message)
              this.open = false
              this.getList()
            })
          } else {
            this.form.status = parseInt(this.form.status)
            this.form.misfire_policy = parseInt(this.form.misfire_policy)
            this.form.concurrent = parseInt(this.form.concurrent)
            this.form.job_type = parseInt(this.form.job_type)
            addSysJob(this.form).then(response => {
              this.msgSuccess(response.message)
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const Ids = (row.job_id && [row.job_id]) || this.ids
      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delSysJob({ 'ids': Ids })
      }).then((response) => {
        this.msgSuccess(response.message)
        this.open = false
        this.getList()
      }).catch(function() {})
    },
    /** 开始按钮操作 */
    handleStart(row) {
      this.$confirm('是否确认启动编号为"' + row.job_id + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return startJob(row.job_id)
      }).then((response) => {
        this.msgSuccess(response.message)
        this.open = false
        this.getList()
      }).catch(function() {})
    },
    /** 停止按钮操作 */
    handleRemove(row) {
      this.$confirm('是否确认关闭编号为"' + row.job_id + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return removeJob(row.job_id)
      }).then((response) => {
        this.msgSuccess(response.message)
        this.open = false
        this.getList()
      }).catch(function() {})
    },
    handleLog() {
      this.$router.push({ path: '/schedule/log' })
    },
    changeCron() {
      this.form.cron_expression = this.cronExpression
      this.cronPopover = false
    }
  }
}
</script>
