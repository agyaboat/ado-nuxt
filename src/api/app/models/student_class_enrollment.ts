import { StudentClassEnrollmentSchema } from '#database/schema'

import { beforeCreate, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import AcademicYear from './academic_year.ts'
import School from './school.ts'
import SchoolClass from './school_class.ts'
import SchoolStaff from './school_staff.ts'
import SchoolStudent from './school_student.ts'
import User from './user.ts'

import { v4 as uuid } from 'uuid'

export default class StudentClassEnrollment extends StudentClassEnrollmentSchema {
  @beforeCreate()
  public static assignDefaults(item: StudentClassEnrollment) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolStudent, {
    foreignKey: 'studentId',
  })
  declare student: BelongsTo<typeof SchoolStudent>

  @belongsTo(() => SchoolClass, {
    foreignKey: 'classId',
  })
  declare class: BelongsTo<typeof SchoolClass>

  @belongsTo(() => AcademicYear, {
    foreignKey: 'academicYearId',
  })
  declare academicYear: BelongsTo<typeof AcademicYear>

  @belongsTo(() => SchoolClass, {
    foreignKey: 'promotedFromClassId',
  })
  declare promotedFromClass: BelongsTo<typeof SchoolClass>

  @belongsTo(() => SchoolStaff, {
    foreignKey: 'addedByStaffId',
  })
  declare addedByStaff: BelongsTo<typeof SchoolStaff>

  @belongsTo(() => User, {
    foreignKey: 'addedByUserId',
  })
  declare addedByUser: BelongsTo<typeof User>
}
