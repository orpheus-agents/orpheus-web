import { get } from '../api/client'
import { useCatalogList } from './useCatalogList'
export { CATALOG_ACTIVITY as TEMPLATE_ACTIVITY, PAGE_SIZES, catalogList as templateList } from './useCatalogList'
export function useTemplates() {
  return useCatalogList('templates', (signal, query) => get('/api/v1/templates', { signal, query }))
}
