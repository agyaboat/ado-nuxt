import type { HttpContext } from '@adonisjs/core/http'
import { updateSchoolSettings } from '#validators/edutools/fees_manager/settings'

export default class SettingsController {
  async update({ request, response, feesManager }: HttpContext) {
    const { name, phone, email, website, country, region, town, venueDetails } =
      await request.validateUsing(updateSchoolSettings)

    const { school } = feesManager

    school.name = name
    school.phone = phone ?? null
    school.email = email ?? null
    school.website = website ?? null

    school.venueDetails = {
      ...(venueDetails ?? {}),
      country: country ?? venueDetails?.country ?? null,
      region: region ?? venueDetails?.region ?? null,
      town: town ?? venueDetails?.town ?? null,
    }

    await school.save()

    await school.load('currentAcademicPeriod', (query) => {
      query.preload('academicYear')
    })

    const currentPeriod = school.currentAcademicPeriod

    return response.ok({
      data: {
        access: {
          id: feesManager.access.id,
          status: feesManager.access.status,
          grantedAt: feesManager.access.grantedAt,
        },

        instance: {
          id: feesManager.instance.id,
          status: feesManager.instance.status,
          eduToolId: feesManager.instance.eduToolId,
          schoolId: feesManager.instance.schoolId,
          startsAt: feesManager.instance.startsAt,
          endsAt: feesManager.instance.endsAt,
          trialEndsAt: feesManager.instance.trialEndsAt,
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

          currentAcademicPeriod: currentPeriod
            ? {
                id: currentPeriod.id,
                label: currentPeriod.label,
                year: {
                  id: currentPeriod.academicYear.id,
                  label: currentPeriod.academicYear.label,
                },
              }
            : null,
        },
      },
    })
  }
}
