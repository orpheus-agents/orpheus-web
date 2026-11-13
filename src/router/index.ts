import { reactive, watch } from 'vue'
import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from 'vue-router'
import { i18n } from '../i18n'

declare module 'vue-router' {
  interface RouteMeta {
    /** Header item the screen belongs to. Child routes inherit it from their section. */
    section?: string
    /** Section menu item the screen belongs to. */
    subsection?: string
  }
}

// The route named after its section or subsection is that menu item's screen. A section with child
// menu items is a parent route; its children become the section menu under the header.
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'analytics', meta: { section: 'analytics' }, component: () => import('../views/AnalyticsView.vue') },
    { path: '/sessions', name: 'sessions', meta: { section: 'sessions' }, component: () => import('../views/SessionsView.vue') },
    { path: '/sessions/:sid', name: 'session', props: true, meta: { section: 'sessions' }, component: () => import('../views/SessionView.vue') },
    { path: '/sessions/:sid/runs/:rid', name: 'run', props: true, meta: { section: 'sessions' }, component: () => import('../views/SessionView.vue') },
    {
      path: '/settings',
      name: 'settings',
      meta: { section: 'settings' },
      redirect: { name: 'limits' },
      children: [
        { path: 'limits', name: 'limits', meta: { subsection: 'limits' }, component: () => import('../views/LimitsView.vue') },
        { path: 'templates', name: 'templates', meta: { subsection: 'templates' }, component: () => import('../views/TemplatesView.vue') },
        { path: 'templates/new', name: 'newTemplate', meta: { subsection: 'templates' }, component: () => import('../views/NewTemplateView.vue') },
        { path: 'templates/:id', name: 'template', props: true, meta: { subsection: 'templates' }, component: () => import('../views/TemplateView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', name: 'missing', component: () => import('../views/NotFoundView.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Filters, pages and run selection keep the reader's place; a new screen starts at the top.
    return screen(to) === screen(from) ? false : { top: 0 }
  },
})
function screen(route: RouteLocationNormalized) {
  if (route.name === 'session' || route.name === 'run') return `session:${String(route.params.sid)}`
  return route.params.id ? `${String(route.name)}:${String(route.params.id)}` : String(route.name)
}

const isMenuItem = (key: 'section' | 'subsection') => (route: RouteRecordRaw) => route.name !== undefined && route.name === route.meta?.[key]
/** Header items in order, each with its section menu items. */
export const navigation = router.options.routes.filter(isMenuItem('section')).map((route) => ({
  name: String(route.name),
  children: (route.children ?? []).filter(isMenuItem('subsection')).map((child) => String(child.name)),
}))

/** Last address of each menu item, so returning to a section restores its filters and page. */
export const sectionLinks = reactive<Record<string, string>>(
  Object.fromEntries(navigation.flatMap(({ name, children }) => [name, ...children]).map((name) => [name, router.resolve({ name }).path])),
)

function title() {
  const route = router.currentRoute.value
  const t = i18n.global.t
  const { section, subsection } = route.meta
  const name = String(route.name)
  // A detail screen is named by its short id; any other screen below a menu item by its own label.
  const details = [route.params.rid, route.params.sid, route.params.id].filter(Boolean).map((id) => String(id).slice(0, 8))
  const own = !details.length && name !== section && name !== subsection ? [name] : []
  const labels = [...own, subsection, section].filter(Boolean).map((key) => t(`nav.${key}`))
  document.title = [...details, ...labels, t('app.name')].join(' / ')
  document.documentElement.lang = i18n.global.locale.value
}
router.afterEach((to) => {
  const { section, subsection } = to.meta
  if (to.name === section || to.name === subsection) {
    sectionLinks[String(to.name)] = to.fullPath
    if (section) sectionLinks[section] = to.fullPath
  }
  title()
})
watch(i18n.global.locale, title)
