import type SchoolStudent from '#models/school_student'

export default class StudentSerializer {
  static serialize(student: SchoolStudent) {
    return {
      id: student.id,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      studentCode: student.studentCode,
      phone: student.phone,
      email: student.email,
      gender: student.gender,
      residentialStatus: student.residentialStatus,
      studentStatus: student.studentStatus,
      avatar: student.avatar,
      class: {
        label: student.currentEnrollment?.class?.label,
        id: student.currentEnrollment?.class?.id,
        year: student.currentEnrollment?.academicYear?.label,
      },
    }
  }

  static serializeMany(students: SchoolStudent[]) {
    return students.map((student) => this.serialize(student))
  }
}
