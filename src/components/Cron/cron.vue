<template>
  <div class="cron" :val="value_">
    <el-row>
      <el-col :span="17">
        <el-tabs v-model="activeName">
          <el-tab-pane label="秒" name="s">
            <second-and-minute v-model="sVal" lable="秒" />
          </el-tab-pane>
          <el-tab-pane label="分" name="m">
            <second-and-minute v-model="mVal" lable="分" />
          </el-tab-pane>
          <el-tab-pane label="时" name="h">
            <hour v-model="hVal" lable="时" />
          </el-tab-pane>
          <el-tab-pane label="日" name="d">
            <day v-model="dVal" lable="日" :disable="disableday" />
          </el-tab-pane>
          <el-tab-pane label="月" name="month">
            <month v-model="monthVal" lable="月" />
          </el-tab-pane>
          <el-tab-pane label="周" name="week">
            <week v-model="weekVal" lable="周" :disable="disableweek" />
          </el-tab-pane>
          <!--          <el-tab-pane label="年" name="year">-->
          <!--            <year v-model="yearVal" lable="年" />-->
          <!--          </el-tab-pane>-->
        </el-tabs>
        <el-table :data="tableData" size="mini" border style="width: 100%; margin-top: 5px;">
          <el-table-column prop="sVal" label="秒" min-width="60" />
          <el-table-column prop="mVal" label="分" min-width="60" />
          <el-table-column prop="hVal" label="时" min-width="60" />
          <el-table-column prop="dVal" label="日" min-width="60" />
          <el-table-column prop="monthVal" label="月" min-width="60" />
          <el-table-column prop="weekVal" label="周" min-width="60" />
          <!--          <el-table-column prop="yearVal" label="年" min-width="60" />-->
        </el-table>
      </el-col>
      <el-col :span="7">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>最近运行时间</el-breadcrumb-item>
        </el-breadcrumb>
        <el-timeline>
          <el-timeline-item
            v-for="(timestamp, index) in cronrecenttime"
            :key="index"
            :timestamp="timestamp"
          />
        </el-timeline>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SecondAndMinute from './secondAndMinute'
import hour from './hour'
import day from './day'
import month from './month'
import week from './week'
// import year from './year'
import { getParsecron } from '@/api/job/sys-job'

export default {
  components: {
    SecondAndMinute,
    hour,
    day,
    month,
    week
    // year
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeName: 's',
      collapseactiveName: ['1'],
      sVal: '',
      mVal: '',
      hVal: '',
      dVal: '',
      monthVal: '',
      weekVal: '',
      // yearVal: '',
      cronrecenttime: [],
      disableweek: false,
      disableday: false
    }
  },
  computed: {
    tableData() {
      return [
        {
          sVal: this.sVal,
          mVal: this.mVal,
          hVal: this.hVal,
          dVal: this.dVal,
          monthVal: this.monthVal,
          weekVal: this.weekVal
          // yearVal: this.yearVal
        }
      ]
    },
    value_() {
      if (!this.dVal && !this.weekVal) {
        return ''
      }
      //
      // if (this.dVal === "?" && this.weekVal === "?") {
      //   this.$message.error("日期与星期不可以同时为“不指定”");
      // }
      // if (this.dVal !== "?" && this.weekVal !== "?") {
      //   this.$message.error("日期与星期必须有一个为“不指定”");
      // }

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.disableweek = this.dVal !== '?'

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.disableday = this.weekVal !== '?'

      // 日 不指定  周 可以选
      // 日 指定 周 禁止
      // 周 不指定 日 可以选
      // 周 指定 日 禁止选

      const v = `${this.sVal} ${this.mVal} ${this.hVal} ${this.dVal} ${this.monthVal} ${this.weekVal}`
      if (v !== this.value) {
        this.$emit('input', v)
      }
      return v
    }
  },
  watch: {
    value(a, b) {
      this.updateVal()
      this.handleChange()
    }
  },
  created() {
    this.updateVal()
    this.handleChange()
  },
  methods: {
    updateVal() {
      if (!this.value) {
        return
      }
      if (this.value.indexOf('@') !== -1) {
        return
      }
      const arrays = this.value.split(' ')
      this.sVal = arrays[0]
      this.mVal = arrays[1]
      this.hVal = arrays[2]
      this.dVal = arrays[3]
      this.monthVal = arrays[4]
      this.weekVal = arrays[5]
      // this.yearVal = arrays[6]
    },
    handleChange() {
      if (this.value === '') {
        return
      }
      getParsecron(this.value).then(response => {
        this.cronrecenttime = response.data
      })
    }
  }
}
</script>

<style lang="css">
.cron {
  text-align: left;
  padding: 10px;
  background: #fff;
  /*border: 1px solid #dcdfe6;*/
  /*box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);*/
}

.cron .el-tab-pane {
  line-height: 35px;
}

.cron .el-checkbox-group {
  line-height: 20px;
}

.cron .el-breadcrumb {
  margin-top: 60px;
  padding-left: 40px;
  margin-bottom: 20px;
}
</style>
