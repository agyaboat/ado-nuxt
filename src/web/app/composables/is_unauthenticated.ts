export const useIsUnauthenticated = (response: Response) => {
  if(response.status === 401){
    navigateTo('/auth', {external: true})
  }
}
