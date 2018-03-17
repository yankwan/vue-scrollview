import Vue from 'vue'
import Router from 'vue-router'
import ListView from 'components/listView/listView'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'listView',
      component: ListView
    }
  ]
})
