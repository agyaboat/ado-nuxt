export const useCapitalize = () => {
  const capitalize = (str: string): string => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const capitalizeWords = (str: string): string => {
    if (!str) return ''
    return str
      .split(' ')
      .map(word => capitalize(word))
      .join(' ')
  }

  return {
    capitalize,
    capitalizeWords
  }
}
