import { SchoolClassSchema } from '#database/schema'

import { beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import School from './school.ts'
import SchoolClassGroup from './school_class_group.ts'
import StudentClassEnrollment from './student_class_enrollment.ts'

import { v4 as uuid } from 'uuid'

export default class SchoolClass extends SchoolClassSchema {
  @beforeCreate()
  public static assignDefaults(item: SchoolClass) {
    if (!item.id) {
      item.id = uuid()
    }
  }

  @belongsTo(() => School, {
    foreignKey: 'schoolId',
  })
  declare school: BelongsTo<typeof School>

  @belongsTo(() => SchoolClassGroup, {
    foreignKey: 'classGroupId',
  })
  declare classGroup: BelongsTo<typeof SchoolClassGroup>

  @belongsTo(() => SchoolClass, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof SchoolClass>

  @hasMany(() => SchoolClass, {
    foreignKey: 'parentId',
  })
  declare variants: HasMany<typeof SchoolClass>

  @belongsTo(() => SchoolClass, {
    foreignKey: 'promotedFromClassId',
  })
  declare promotedFromClass: BelongsTo<typeof SchoolClass>

  @hasMany(() => SchoolClass, {
    foreignKey: 'promotedFromClassId',
  })
  declare promotedClasses: HasMany<typeof SchoolClass>

  @hasMany(() => StudentClassEnrollment, {
    foreignKey: 'classId',
  })
  declare studentEnrollments: HasMany<typeof StudentClassEnrollment>

  @hasMany(() => StudentClassEnrollment, {
    foreignKey: 'classId',
  })
  declare enrollments: HasMany<typeof StudentClassEnrollment>
}
