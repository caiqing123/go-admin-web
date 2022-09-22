<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nick_name">
      <el-input v-model="user.nick_name" />
    </el-form-item>
    <el-form-item label="城市" prop="city">
      <el-input v-model="user.city" />
    </el-form-item>
    <el-form-item label="介绍" prop="introduction">
      <el-input v-model="user.introduction" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUser } from '@/api/admin/sys-user'

export default {
  props: {
    // eslint-disable-next-line vue/require-default-prop
    user: { type: Object }
  },
  data() {
    return {
      // 表单校验
      rules: {
        nick_name: [
          { required: true, message: '用户昵称不能为空', trigger: 'blur' }
        ],
        city: [
          { required: true, message: '城市不能为空', trigger: 'blur' }
        ],
        introduction: [
          { required: true, message: '介绍不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          updateUser(this.user).then(response => {
            this.msgSuccess('成功')
            this.user = response.data
          })
        }
      })
    },
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ path: '/index' })
    }
  }
}
</script>
