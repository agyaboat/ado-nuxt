import { controllers } from '#generated/controllers'
import SendSms from '#jobs/send_sms'
import FeeStudentLedger from '#models/fee_student_ledger'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
// import redis from '@adonisjs/redis/services/main'

router
  .group(() => {
    router.get('access', [controllers.edutools.feesManager.Accesses, 'show'])
    router.patch('settings', [controllers.edutools.feesManager.Settings, 'update'])
    router.get('setup-wizard', [controllers.edutools.feesManager.SetupWizards, 'show'])
    router.get('dashboard/:academicPeriodId', [controllers.edutools.feesManager.Dashboard, 'index'])
    router.get('academic-years', [controllers.edutools.feesManager.AcademicYears, 'index'])
    router.post('academic-years', [controllers.edutools.feesManager.AcademicYears, 'store'])
    router.patch('academic-years/:academicYearId/update', [
      controllers.edutools.feesManager.AcademicYears,
      'update',
    ])

    router.delete('academic-years/:academicYearId/delete', [
      controllers.edutools.feesManager.AcademicYears,
      'deleteYear',
    ])

    router.post('academic-years/:academicYearId/periods', [
      controllers.edutools.feesManager.AcademicYears,
      'storePeriod',
    ])

    //
    router.patch('set-current-period', [
      controllers.edutools.feesManager.AcademicYears,
      'setCurrentPeriod',
    ])

    router.get('academic-periods/:academicPeriodId', [
      controllers.edutools.feesManager.AcademicPeriods,
      'index',
    ])

    router.delete('academic-periods/:academicPeriodId/delete', [
      controllers.edutools.feesManager.AcademicYears,
      'deletePeriod',
    ])

    router.patch('academic-periods/:academicPeriodId/update', [
      controllers.edutools.feesManager.AcademicYears,
      'updatePeriod',
    ])

    router.post('academic-periods/:academicPeriodId/fee-schedules/synchronize', [
      controllers.edutools.feesManager.FeeSchedules,
      'synchronize',
    ])

    // CLASSES OPERATIONS
    router.get('classes', [controllers.edutools.feesManager.Classes, 'index'])
    router.post('classes', [controllers.edutools.feesManager.Classes, 'store'])
    router.patch('classes/:classId', [controllers.edutools.feesManager.Classes, 'update'])
    router.post('classes/reorder', [controllers.edutools.feesManager.Classes, 'reorder'])
    router.delete('classes/:classId', [controllers.edutools.feesManager.Classes, 'delete'])

    // STUDENT OPERATIONS
    // STUDENTS OPERATIONS
    router.get('students', [controllers.edutools.feesManager.Students, 'index'])
    router.post('students', [controllers.edutools.feesManager.Students, 'store'])
    router.get('students/search', [controllers.edutools.feesManager.Students, 'searchStudents'])
    router.post('students/upload', [controllers.edutools.feesManager.Students, 'upload'])
    router.get('students/uploads', [controllers.edutools.feesManager.Students, 'getUploads'])

    router.patch('students/:studentId', [controllers.edutools.feesManager.Students, 'update'])
    router.delete('students/:studentId', [controllers.edutools.feesManager.Students, 'delete'])

    //FEE SCHEDULES
    // FEE SCHEDULES OPERATIONS
    router.get('fee-schedules', [controllers.edutools.feesManager.FeeSchedules, 'index'])
    router.post('fee-schedules', [controllers.edutools.feesManager.FeeSchedules, 'store'])
    router.patch('fee-schedules/:feeId', [controllers.edutools.feesManager.FeeSchedules, 'update'])
    router.post('fee-schedules/:feeId/apply', [
      controllers.edutools.feesManager.FeeSchedules,
      'apply',
    ])
    router.delete('fee-schedules/:feeId', [controllers.edutools.feesManager.FeeSchedules, 'delete'])

    //PAYMENTS
    router.get('students/:classId', [controllers.edutools.feesManager.Payments, 'getStudents'])
    router.get('students/:studentId/arrears', [
      controllers.edutools.feesManager.Payments,
      'getArrears',
    ])
    router.post('payments', [controllers.edutools.feesManager.Payments, 'store'])
    router.get('payments', [controllers.edutools.feesManager.Payments, 'index'])
    router.get('payments/:paymentId/allocations', [
      controllers.edutools.feesManager.Payments,
      'getAllocations',
    ])

    router.get('arrears', [controllers.edutools.feesManager.Arrears, 'index'])
  })
  .prefix('/edutools/fees_manager/:accessId')
  .use(middleware.auth())
  .use(middleware.feesManagerAccess())

// router.get('/md', async () => {
//   await redis.set('username', 'virk')
//   return { set: true }
// })

// router.get('/mq', async () => {
//   const x = await redis.get('username')
//   return { x }
// })
router.get('/mq', async () => {
  const x = await FeeStudentLedger.all()
  return x
})

router.get('sms', async () => {
  await SendSms.dispatch({ phoneNumber: '233552156306', message: 'Testing scholarsaas sms. #3' })
  return { message: 'Scheduled' }
})
