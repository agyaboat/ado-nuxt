import { laraFetch } from "lara-fetch"
laraFetch.configure({
  baseURL: useRuntimeConfig().public.api,
  csrfPath: '/fr',
  debug: false,
})
export const useAdoFetch = () => {
  return laraFetch
}

export const adofetch = useAdoFetch()
