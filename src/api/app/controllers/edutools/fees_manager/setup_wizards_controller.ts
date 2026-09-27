import type { HttpContext } from '@adonisjs/core/http'
import Class from '#models/school_class'
import Student from '#models/school_student'
import FeeSchedule from '#models/fee_schedule'
// import School from '#models/school'

export default class SetupWizardController {
  async show({ feesManager, response }: HttpContext) {
    const { school } = feesManager

    const classExists = await Class.query().where('schoolId', school.id).first()

    const studentExists = await Student.query().where('schoolId', school.id).first()

    const feeScheduleExists = await FeeSchedule.query().where('schoolId', school.id).first()

    await school.load('currentAcademicPeriod')

    return response.ok({
      data: {
        class: Boolean(classExists),
        period: Boolean(school.currentAcademicPeriod),
        fees: Boolean(feeScheduleExists),
        student: Boolean(studentExists),
      },
    })
  }
}
