
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="用户名" prop="username"><el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>
          <el-form-item label="状态" prop="status"><el-select
            v-model="queryParams.status"
            placeholder="系统登录日志状态"
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
          <el-form-item label="ip地址" prop="ipaddr"><el-input
            v-model="queryParams.ipaddr"
            placeholder="请输入ip地址"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="loading" :data="loginlogList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            label="用户名"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="类型"
            align="center"
            prop="msg"
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
          <el-table-column
            label="ip地址"
            align="center"
            prop="ipaddr"
          >
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>IP: {{ scope.row.ipaddr }}</p>
                <p>归属地: {{ scope.row.login_location }}</p>
                <p>浏览器: {{ scope.row.browser }}</p>
                <p>系统: {{ scope.row.os }}</p>
                <p>固件: {{ scope.row.platform }}</p>
                <div slot="reference" class="name-wrapper">
                  {{ scope.row.ipaddr }}
                </div>
              </el-popover>
            </template>
          </el-table-column>

          <el-table-column
            label="登录时间"
            align="center"
            prop="login_time"
            width="180"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.login_time) }}</span>
            </template>
          </el-table-column>
          <pagination
            v-show="total>0"
            :total="total"
            :page.sync="queryParams.page"
            :limit.sync="queryParams.per_page"
            @pagination="getList"
          />
        </el-table></el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { listSysLoginlog } from '@/api/admin/sys-login-log'

export default {
  name: 'SysLoginLogManage',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
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
      fileOpen: false,
      fileIndex: undefined,
      // 类型数据字典
      loginlogList: [],
      statusOptions: [],
      // 关系表类型

      // 查询参数
      queryParams: {
        page: 1,
        per_page: 10,
        username: undefined,
        status: undefined,
        ipaddr: undefined,
        loginLocation: undefined,
        createdAtOrder: 'desc'
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
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listSysLoginlog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.loginlogList = response.data
        this.total = response.pager.TotalCount
        this.loading = false
      }
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 关系
    // 文件
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    }
  }
}
</script>
