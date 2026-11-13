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
      children: [{ path: 'limits', name: 'limits', meta: { subsection: 'limits' }, component: () => import('../views/LimitsView.vue') }],
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
  return route.name === 'session' || route.name === 'run' ? `session:${String(route.params.sid)}` : String(route.name)
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
  const sections = [route.meta.subsection, route.meta.section ?? String(route.name)].filter(Boolean).map((key) => t(`nav.${key}`))
  const details = route.params.rid ? [String(route.params.rid).slice(0, 8), String(route.params.sid).slice(0, 8)] : route.params.sid ? [String(route.params.sid).slice(0, 8)] : []
  document.title = [...details, ...sections, t('app.name')].join(' / ')
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
