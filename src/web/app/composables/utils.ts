export function generateColorModeScript() {
  return `
(function () {
  try {
    // if (document.body.dataset.landing === 'true') {
    //   document.documentElement.classList.add('dark')
    //   return
    // }

    const stored = localStorage.getItem('color-mode')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const mode = stored || (systemDark ? 'dark' : 'light')

    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } catch (_) {}
})()
`
}

import imageCompression from 'browser-image-compression'

const MAX_MB = 1.0
const MB = 1024 * 1024
export const compressImage = async (file: File) => {
  if(file.size <= MAX_MB * MB){
    return file
  }
  const options = {
    maxSizeMB: 1,            // hard cap
    useWebWorker: true,
  }

  return await imageCompression(file, options)
}
