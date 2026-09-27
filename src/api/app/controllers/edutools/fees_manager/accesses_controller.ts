import type { HttpContext } from '@adonisjs/core/http'

export default class AccessesController {
  async show({ feesManager, response }: HttpContext) {
    const { access, instance, school } = feesManager

    await school.load('currentAcademicPeriod', (q) => {
      q.preload('academicYear')
    })

    const currentPeriod = school.currentAcademicPeriod

    return response.ok({
      data: {
        access: {
          id: access.id,
          status: access.status,
          grantedAt: access.grantedAt,
        },

        instance: {
          id: instance.id,
          status: instance.status,
          eduToolId: instance.eduToolId,
          schoolId: instance.schoolId,
          startsAt: instance.startsAt,
          endsAt: instance.endsAt,
          trialEndsAt: instance.trialEndsAt,
        },
        school: {
          id: school.id,
          name: school.name,
          code: school.code,
          slug: school.slug,

          type: school.type,
          ownershipType: school.ownershipType,

          countryCode: school.countryCode,
          venueDetails: school.venueDetails,

          phone: school.phone,
          email: school.email,
          website: school.website,

          currentAcademicPeriod: {
            id: currentPeriod?.id,
            label: currentPeriod?.label,
            year: {
              id: currentPeriod?.academicYear?.id,
              label: currentPeriod?.academicYear?.label,
            },
          },
        },
      },
    })
  }
}
