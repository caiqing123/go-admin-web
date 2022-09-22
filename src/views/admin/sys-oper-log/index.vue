<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="操作状态"
              clearable
              size="small"
              style="width: 160px"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              size="small"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysOperLog:clean']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleClean"
            >删除1个月前的</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysOperLog:export']"
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
            >导出</el-button>
          </el-col>
        </el-row>

        <el-table v-loading="loading" :data="list" border>
          <el-table-column label="编号" width="70" prop="id" />
          <el-table-column
            label="Request info"
            prop="opera_url"
          >
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">

                <p>Request:
                  <el-tag v-if="scope.row.request_method=='GET'">{{ scope.row.request_method }}</el-tag>
                  <el-tag v-if="scope.row.request_method=='POST'" type="success">{{ scope.row.request_method }}</el-tag>
                  <el-tag v-if="scope.row.request_method=='PUT'" type="warning">{{ scope.row.request_method }}</el-tag>
                  <el-tag v-if="scope.row.request_method=='DELETE'" type="danger">{{ scope.row.request_method }}</el-tag>
                  {{ scope.row.opera_url }}
                </p>
                <p>Host: {{ scope.row.opera_ip }}</p>
                <p>Location: {{ scope.row.opera_location }}</p>
                <p>耗时: {{ scope.row.latency_time }}</p>
                <div slot="reference" class="name-wrapper">
                  <el-tag v-if="scope.row.request_method=='GET'">{{ scope.row.request_method }}</el-tag>
                  <el-tag v-if="scope.row.request_method=='POST'" type="success">{{ scope.row.request_method }}</el-tag>
                  <el-tag v-if="scope.row.request_method=='PUT'" type="warning">{{ scope.row.request_method }}</el-tag>
                  <el-tag v-if="scope.row.request_method=='DELETE'" type="danger">{{ scope.row.request_method }}</el-tag>
                  {{ scope.row.opera_url }}
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            label="操作人员"
            prop="opera_name"
            width="160"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="状态"
            prop="status"
            width="80"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status=='2'" type="success">{{ statusFormat(scope.row,scope.row.status) }}</el-tag>
              <el-tag v-if="scope.row.status=='1'" type="danger">{{ statusFormat(scope.row,scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作日期" prop="opera_time" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.opera_time) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="80"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:sysOperLog:query']"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="handleView(scope.row,scope.index)"
              >详细</el-button>
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

        <!-- 操作日志详细 -->
        <el-dialog title="操作日志详细" :visible.sync="open" width="80%">
          <el-form ref="form" :model="form" label-width="100px" size="mini">
            <el-row>
              <el-col :span="24">
                <el-form-item label="请求地址：">{{ form.opera_url }}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="登录信息："
                >{{ form.opera_name }} / {{ form.opera_ip }} / {{ form.opera_location }}</el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="请求方式：">{{ form.request_method }}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="耗时：">{{ form.latency_time }}</el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="请求参数：">{{ form.opera_param }}</el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="返回参数：">{{ form.json_result }}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="操作状态：">
                  <div v-if="form.status === '2'">正常</div>
                  <div v-else-if="form.status === '1'">关闭</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="操作时间：">{{ parseTime(form.opera_time) }}</el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="open = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { cleanOperaLog, listSysOperaLog } from '@/api/admin/sys-opera-log'
import { formatJson } from '@/utils'

export default {
  name: 'SysOperLogManage',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      statusOptions: [],
      pickerOptions: {},
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        page: 1,
        per_page: 10,
        status: undefined
      }
    }
  },
  created() {
    this.getList()

    this.getDicts('sys_common_status').then(response => {
      this.statusOptions = response.data
    })
  },
  methods: {
    /** 查询登录日志 */
    getList() {
      this.loading = true
      listSysOperaLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.data
        this.total = response.pager.TotalCount
        this.loading = false
      }
      )
    },
    // 操作日志状态字典翻译
    statusFormat(row, column) {
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
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true
      this.form = row
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$confirm('是否确认删除1个月前的操作日志数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return cleanOperaLog()
      }).then((response) => {
        this.msgSuccess(response.message)
        this.open = false
        this.getList()
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      // const queryParams = this.queryParams
      this.$confirm('是否确认导出所有操作日志数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['日志编号', '系统模块', '操作类型', '请求方式', '操作人员', '主机', '操作地点', '操作状态', '操作url', '操作日期']
          const filterVal = ['id', 'title', 'business_type', 'method', 'opera_name', 'opera_ip', 'opera_location', 'status', 'opera_url', 'opera_time']
          const list = this.list
          const data = formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '操作日志',
            autoWidth: true, // Optional
            bookType: 'xlsx' // Optional
          })
          this.downloadLoading = false
        })
      })
    }
  }
}
</script>

