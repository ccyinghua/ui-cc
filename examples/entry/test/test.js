import Vue from 'vue'
import TestView from './test.vue'

// 全部加载
// import UICC from 'ui-cc'
Vue.use(UICC)
// import 'ui-cc/lib/theme-chalk/index.css'

import UICC from 'packages/index.js'
import 'packages/theme-chalk/src/index.scss'



// 按需加载
// import { Button, Tag } from 'ui-cc'
// Vue.use(Button)
// Vue.component(Tag.name, Tag)


new Vue({
  el: '#test',
  render: h => h(TestView)
})
