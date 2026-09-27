import School from '#models/school'
import string from '@adonisjs/core/helpers/string'

const DEFAULT_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export async function generateSchoolCode(
  length = 5,
  characters = DEFAULT_CHARACTERS
): Promise<string> {
  if (length < 1) {
    throw new Error('School code length must be greater than 0.')
  }

  if (!characters.length) {
    throw new Error('School code characters cannot be empty.')
  }

  const schools = await School.query().select('code')

  const existingCodes = new Set(schools.map((school) => school.code?.toUpperCase()).filter(Boolean))

  while (true) {
    let code = ''

    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    if (!existingCodes.has(code.toUpperCase())) {
      return code
    }
  }
}

const SLUG_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789'

function generateSuffix(length = 3): string {
  let result = ''

  for (let i = 0; i < length; i++) {
    result += SLUG_CHARACTERS.charAt(Math.floor(Math.random() * SLUG_CHARACTERS.length))
  }

  return result
}

export async function generateUniqueSchoolSlug(schoolName: string): Promise<string> {
  const baseSlug = string.slug(schoolName)

  while (true) {
    const candidate = `${baseSlug}-${generateSuffix()}`

    const existingSchool = await School.query().where('slug', candidate).first()

    if (!existingSchool) {
      return candidate
    }
  }
}
