export const useColorMode = (lockDark = false) => {
  const isDark = ref(false)

  const applyMode = (value: boolean) => {
    const root = document.documentElement
    // if (document.body.dataset.landing === 'true') {
    //   document.documentElement.classList.add('dark')
    //   return
    // }
    if (lockDark) {
      root.classList.add('dark')
      return
    }
    if (value) root.classList.add('dark')
    else root.classList.remove('dark')
  }

  const setColorMode = (value: boolean) => {
    // if (lockDark) return // ignore toggle on landing page
    // if (document.body.dataset.landing === 'true') {
    //   document.documentElement.classList.add('dark')
    //   return
    // }
    isDark.value = value
    localStorage.setItem('color-mode', value ? 'dark' : 'light')
    applyMode(value)
  }

  const initColorMode = () => {
    if (lockDark) {
      applyMode(true)
      isDark.value = true
      return
    }

    const saved = localStorage.getItem('color-mode')
    const darkMode = saved === 'dark'
    isDark.value = darkMode
    applyMode(darkMode)
  }

  onMounted(() => {
    initColorMode()
  })

  return {
    isDark,
    setColorMode,
    initColorMode
  }
}
