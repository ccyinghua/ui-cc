import Vue from 'vue'
import IndexView from './index.vue'
import router from './router'

import demoBlock from './components/demo-block.vue'
import UICC from 'ui-cc'
import 'ui-cc/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.component('demo-block', demoBlock)
Vue.use(UICC)

new Vue({
  el: '#app',
  router,
  render: h => h(IndexView)
});


