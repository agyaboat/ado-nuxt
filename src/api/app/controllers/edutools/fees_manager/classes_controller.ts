import type { HttpContext } from '@adonisjs/core/http'
import SchoolClass from '#models/school_class'
import SchoolClassSerializer from '#serializers/edutools/fees_manager/school_class_serializer'
import {
  createSchoolClassValidator,
  deleteSchoolClassValidator,
  reorderSchoolClassesValidator,
  updateSchoolClassValidator,
} from '#validators/edutools/fees_manager/classes'
import AcademicPeriod from '#models/academic_period'
import db from '@adonisjs/lucid/services/db'

export default class ClassesController {
  async index({ feesManager, response }: HttpContext) {
    const school = feesManager.school

    let academicYearId: string | null = null

    if (school.currentAcademicPeriodId) {
      const currentPeriod = await AcademicPeriod.query()
        .where('id', school.currentAcademicPeriodId)
        .where('school_id', school.id)
        .first()

      academicYearId = currentPeriod?.academicYearId ?? null
    }

    const classes = await SchoolClass.query()
      .where('school_id', school.id)
      .whereNull('parent_id')
      .if(academicYearId, (query) => {
        query.withCount('enrollments', (enrollmentQuery) => {
          enrollmentQuery.where('academic_year_id', academicYearId!).where('status', 'active')
        })
      })
      .preload('variants', (query) => {
        query
          .if(academicYearId, (variantQuery) => {
            variantQuery.withCount('enrollments', (enrollmentQuery) => {
              enrollmentQuery.where('academic_year_id', academicYearId!).where('status', 'active')
            })
          })
          .orderBy('label', 'asc')
      })
      .orderByRaw('sort_order IS NULL, sort_order ASC')
      .orderBy('label', 'asc')

    return response.ok({
      data: SchoolClassSerializer.serializeMany(classes),
    })
  }

  async store({ feesManager, request, response, auth }: HttpContext) {
    const school = feesManager.school
    const user = auth.user!

    const payload = await request.validateUsing(createSchoolClassValidator)

    const normalizedLabel = payload.label.toLowerCase()

    const existingClass = await SchoolClass.query()
      .where('school_id', school.id)
      .whereRaw('LOWER(label) = ?', [normalizedLabel])
      .first()

    if (existingClass) {
      return response.conflict({
        message: 'A class with this label already exists.',
      })
    }

    let parentClass: SchoolClass | null = null

    if (payload.parentId) {
      parentClass = await SchoolClass.query()
        .where('id', payload.parentId)
        .where('school_id', school.id)
        .first()

      if (!parentClass) {
        return response.notFound({
          message: 'Parent class not found.',
        })
      }

      if (parentClass.parentId) {
        return response.conflict({
          message: 'A class variant cannot have variants.',
        })
      }
    }

    const schoolClass = await SchoolClass.create({
      schoolId: school.id,
      label: payload.label,
      parentId: parentClass?.id ?? null,
      sortOrder: null,
      createdByUserId: user.userId,
    })

    return response.created({
      message: parentClass ? 'Class variant created successfully.' : 'Class created successfully.',
      data: SchoolClassSerializer.serialize(schoolClass),
    })
  }
  async update({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { params, ...payload } = await request.validateUsing(updateSchoolClassValidator)

    const schoolClass = await SchoolClass.query()
      .where('id', params.classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({
        message: 'Class not found.',
      })
    }

    const normalizedLabel = payload.label.toLowerCase()

    const existingClass = await SchoolClass.query()
      .where('school_id', school.id)
      .whereRaw('LOWER(label) = ?', [normalizedLabel])
      .whereNot('id', schoolClass.id)
      .first()

    if (existingClass) {
      return response.conflict({
        message: 'A class with this label already exists.',
      })
    }

    if (payload.parentId) {
      if (payload.parentId === schoolClass.id) {
        return response.conflict({
          message: 'A class cannot be its own parent.',
        })
      }

      const parentClass = await SchoolClass.query()
        .where('id', payload.parentId)
        .where('school_id', school.id)
        .first()

      if (!parentClass) {
        return response.notFound({
          message: 'Parent class not found.',
        })
      }

      if (parentClass.parentId) {
        return response.conflict({
          message: 'A class variant cannot have variants.',
        })
      }
    }

    schoolClass.label = payload.label
    schoolClass.parentId = payload.parentId

    await schoolClass.save()

    return response.ok({
      message: 'Class updated successfully.',
      data: SchoolClassSerializer.serialize(schoolClass),
    })
  }

  async reorder({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { classIds } = await request.validateUsing(reorderSchoolClassesValidator)

    const classes = await SchoolClass.query()
      .where('school_id', school.id)
      .whereNull('parent_id')
      .whereIn('id', classIds)

    if (classes.length !== classIds.length) {
      return response.badRequest({
        message: 'One or more classes are invalid.',
      })
    }

    await db.transaction(async (trx) => {
      const cases = classIds
        .map((classId, index) => `WHEN '${classId}' THEN ${index + 1}`)
        .join(' ')

      const placeholders = classIds.map(() => '?').join(', ')

      await trx.rawQuery(
        `
        UPDATE school_classes
        SET sort_order = CASE id
          ${cases}
        END
        WHERE school_id = ?
          AND parent_id IS NULL
          AND id IN (${placeholders})
      `,
        [school.id, ...classIds]
      )
    })

    return response.ok({
      message: 'Classes reordered successfully.',
    })
  }

  async delete({ feesManager, request, response }: HttpContext) {
    const school = feesManager.school

    const { params } = await request.validateUsing(deleteSchoolClassValidator)

    const schoolClass = await SchoolClass.query()
      .where('id', params.classId)
      .where('school_id', school.id)
      .first()

    if (!schoolClass) {
      return response.notFound({
        message: 'Class not found.',
      })
    }

    const variant = await SchoolClass.query().where('parent_id', schoolClass.id).first()

    if (variant) {
      return response.conflict({
        message: 'This class cannot be deleted because it has variants. Delete its variants first.',
      })
    }

    await schoolClass.delete()

    return response.ok({
      message: 'Class deleted successfully.',
    })
  }
}
