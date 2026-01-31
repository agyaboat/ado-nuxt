export const useTruncate = (text?: string, limit: number = 12, suffix: string = '...') => {
    if (!text) return ''
    if (text.length <= limit) return text
    return text.slice(0, limit) + suffix
}
