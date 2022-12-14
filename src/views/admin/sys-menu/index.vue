<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form :inline="true">
          <el-form-item label="菜单名称">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入菜单名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.visible" placeholder="菜单状态" clearable size="small">
              <el-option
                v-for="dict in visibleOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button
              v-permisaction="['admin:sysMenu:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-form-item>
        </el-form>

        <el-table
          v-loading="loading"
          :data="menuList"
          border
          default-expand-all
          row-key="id"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        >
          <el-table-column prop="title" label="菜单名称" :show-overflow-tooltip="true" width="180px" />
          <el-table-column prop="icon" label="图标" align="center" width="100px">
            <template slot-scope="scope">
              <svg-icon :icon-class="scope.row.icon" />
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="60px" />
          <el-table-column prop="permission" label="权限标识" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.permission==''">-</span>
              <span v-else>{{ scope.row.permission }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="path" label="组件路径" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-if="scope.row.menu_type=='A'">{{ scope.row.path }}</span>
              <span v-else>{{ scope.row.component }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="visible" label="可见" :formatter="visibleFormat" width="80">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.visible === '1' ? 'danger' : 'success'"
                disable-transitions
              >{{ visibleFormat(scope.row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="created_at" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:sysMenu:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改
              </el-button>
              <el-button
                v-permisaction="['admin:sysMenu:add']"
                size="mini"
                type="text"
                icon="el-icon-plus"
                @click="handleAdd(scope.row)"
              >新增
              </el-button>
              <el-button
                v-permisaction="['admin:sysMenu:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加或修改菜单对话框 -->
        <el-drawer
          ref="drawer"
          :title="title"
          :before-close="cancel"
          :visible.sync="open"
          direction="rtl"
          custom-class="demo-drawer"
          size="80%"
        >
          <div class="demo-drawer__content">
            <el-form ref="form" :model="form" :rules="rules" label-position="top" label-width="106px">
              <el-row>
                <el-col :span="24">
                  <el-form-item prop="parent_id">
                    <span slot="label">
                      上级菜单
                      <el-tooltip content="指当前菜单停靠的菜单归属" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <treeselect
                      v-model="form.parent_id"
                      :options="menuOptions"
                      :normalizer="normalizer"
                      :show-count="true"
                      placeholder="选择上级菜单"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="title">
                    <span slot="label">
                      菜单标题
                      <el-tooltip content="菜单位置显示的说明信息" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.title" placeholder="请输入菜单标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="sort">
                    <span slot="label">
                      显示排序
                      <el-tooltip content="根据序号升序排列" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input-number v-model="form.sort" controls-position="right" :min="0" />
                  </el-form-item>
                </el-col>

                <el-col :span="24">
                  <el-form-item prop="menu_type">
                    <span slot="label">
                      菜单类型
                      <el-tooltip content="包含目录：以及菜单或者菜单组，菜单：具体对应某一个页面，按钮：功能才做按钮；" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-radio-group v-model="form.menu_type">
                      <el-radio label="M">目录</el-radio>
                      <el-radio label="C">菜单</el-radio>
                      <el-radio label="F">按钮</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="菜单图标">
                    <el-popover
                      placement="bottom-start"
                      width="460"
                      trigger="click"
                      @show="$refs['iconSelect'].reset()"
                    >
                      <IconSelect ref="iconSelect" @selected="selected" />
                      <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" readonly>
                        <svg-icon
                          v-if="form.icon"
                          slot="prefix"
                          :icon-class="form.icon"
                          class="el-input__icon"
                          style="height: 32px;width: 16px;"
                        />
                        <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                      </el-input>
                    </el-popover>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menu_type == 'M' || form.menu_type == 'C'" prop="menu_name">
                    <span slot="label">
                      路由名称
                      <el-tooltip content="需要和vue页面name保持一致，对应页面即可选择缓存" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.menu_name" placeholder="请输入路由名称" />
                  </el-form-item>
                </el-col>

                <el-col v-if="form.menu_type == 'M' || form.menu_type == 'C'" :span="12">
                  <el-form-item prop="component">
                    <span slot="label">
                      组件路径
                      <el-tooltip
                        content="菜单对应的具体vue页面文件路径views的下级路径/admin/sys-api/index；目录类型：填写Layout，如何有二级目录请参照日志目录填写；"
                        placement="top"
                      >
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.component" placeholder="请输入组件路径" />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item v-if="form.menu_type == 'M' || form.menu_type == 'C'">
                    <span slot="label">
                      是否外链
                      <el-tooltip content="可以通过iframe打开指定地址" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-radio-group v-model="form.is_frame">
                      <el-radio label="0">是</el-radio>
                      <el-radio label="1">否</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item v-if="form.menu_type != 'F'" prop="path">
                    <span slot="label">
                      路由地址
                      <el-tooltip content="访问此页面自定义的url地址，建议/开头书写，例如 /app-name/menu-name" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.path" placeholder="请输入路由地址" />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item v-if="form.menu_type == 'F' || form.menu_type == 'C'">
                    <span slot="label">
                      权限标识
                      <el-tooltip content="前端权限控制按钮是否显示" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.permission" placeholder="请权限标识" maxlength="50" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="form.menu_type != 'F'">
                    <span slot="label">
                      菜单状态
                      <el-tooltip content="需要显示在菜单列表的菜单设置为显示，否则设置为隐藏" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-radio-group v-model="form.visible">
                      <el-radio
                        v-for="dict in visibleOptions"
                        :key="dict.value"
                        :label="dict.value"
                      >{{ dict.label }}
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item v-if="form.menu_type == 'F' || form.menu_type == 'C'">
                    <span slot="label">
                      api权限
                      <el-tooltip content="接口权限判断 请求类型+接口名称，例如 POST-/api/v1/user" placement="top">
                        <i class="el-icon-question" />
                      </el-tooltip>
                    </span>
                    <el-input v-model="form.api_url" placeholder="api权限" maxlength="50" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div class="demo-drawer__footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
            </div>
          </div>

        </el-drawer>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from '@/api/admin/sys-menu'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import IconSelect from '@/components/IconSelect'

export default {
  name: 'SysMenuManage',
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 菜单状态数据字典
      visibleOptions: [],
      // 查询参数
      queryParams: {
        title: undefined,
        visible: undefined
      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {
        title: [{ required: true, message: '菜单标题不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.getDicts('sys_show_hide').then(response => {
      this.visibleOptions = response.data
    })
  },
  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true
      listMenu(this.queryParams).then(response => {
        this.menuList = response.data
        this.loading = false
      })
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.title,
        children: node.children
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = []
        const menu = { id: 0, title: '主类目', children: [] }
        menu.children = response.data
        this.menuOptions.push(menu)
      })
    },
    // 菜单显示状态字典翻译
    visibleFormat(row) {
      if (row.menu_type === 'F') {
        return '-- --'
      }
      // 0显示 1隐藏
      const visible = row.visible === '0' ? 0 : 1
      return this.selectDictLabel(this.visibleOptions, visible)
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        parent_id: 0,
        menu_name: undefined,
        icon: undefined,
        menu_type: 'M',
        sort: 0,
        action: this.form.menu_type === 'A' ? this.form.action : '',
        is_frame: '1',
        visible: '0'
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row != null) {
        this.form.parent_id = row.id
        this.form.menu_type = row.menu_type
      }
      this.open = true
      this.title = '添加菜单'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      getMenu(row.id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改菜单'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateMenu(this.form, this.form.id).then(response => {
              this.msgSuccess(response.message)
              this.open = false
              this.getList()
            })
          } else {
            addMenu(this.form).then(response => {
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
      this.$confirm('是否确认删除名称为"' + row.title + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        const Ids = (row.id && [row.id]) || this.ids
        return delMenu({ 'ids': Ids })
      }).then((response) => {
        this.msgSuccess(response.message)
        this.open = false
        this.getList()
      }).catch(function() {
      })
    }
  }
}
</script>
<style lang="css">
.panel .el-transfer__buttons {
  width: 150px;
}

.panel .el-transfer__buttons .el-button + .el-button {
  margin-left: 0;
}

.panel .el-transfer-panel {
  width: 300px;
}

.el-col {
  padding: 0 5px;
}

.el-drawer__header {
  margin-bottom: 0;
}
</style>
