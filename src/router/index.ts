import { createRouter, createWebHistory } from 'vue-router'
import Edit from '../view/Edit.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Edit
    },
    {
      path: '/edit/new',
      name: 'edit',
      // route level code-splitting
      // this generates a separate chunk (Edit.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../view/Edit.vue')
    },
    {
      path: '/edit/:id',
      name: 'edit',
      // route level code-splitting
      // this generates a separate chunk (Edit.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../view/Edit.vue'),
      props: (route) => {
        return { id: Number(route.params.id) }
      }
    },
    {
      path: '/published/:id',
      name: 'published',
      // route level code-splitting
      // this generates a separate chunk (Edit.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../view/Public.vue'),
      props: (route) => {
        return { id: Number(route.params.id) }
      }
    }
  ]
})

export default router