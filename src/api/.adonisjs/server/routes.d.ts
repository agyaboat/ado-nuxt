import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'market.index': { paramsTuple?: []; params?: {} }
    'market.subscribe': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'workspace.index': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.auth_user': { paramsTuple?: []; params?: {} }
    'auth.verify': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth_v_2.signin': { paramsTuple?: []; params?: {} }
    'auth_v_2.verify_otp': { paramsTuple?: []; params?: {} }
    'auth_v_2.resend_otp': { paramsTuple?: []; params?: {} }
    'auth_v_2.user': { paramsTuple?: []; params?: {} }
    'auth_v_2.complete_setup': { paramsTuple?: []; params?: {} }
    'user_settings.update_basic_details': { paramsTuple?: []; params?: {} }
    'user_settings.set_password': { paramsTuple?: []; params?: {} }
    'user_settings.change_password': { paramsTuple?: []; params?: {} }
    'user_settings.request_phone_change': { paramsTuple?: []; params?: {} }
    'user_settings.confirm_phone_change': { paramsTuple?: []; params?: {} }
    'webs.home': { paramsTuple?: []; params?: {} }
    'accesses.show': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'settings.update': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'setup_wizards.show': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'dashboard.index': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'academic_years.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_years.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_years.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicYearId': ParamValue} }
    'academic_years.delete_year': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicYearId': ParamValue} }
    'academic_years.store_period': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicYearId': ParamValue} }
    'academic_years.set_current_period': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_periods.index': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'academic_years.delete_period': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'academic_years.update_period': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'fee_schedules.synchronize': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'classes.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'classes.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'classes.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'classes.reorder': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'classes.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'students.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.search_students': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.upload': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.get_uploads': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'students.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'fee_schedules.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'fee_schedules.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'fee_schedules.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'feeId': ParamValue} }
    'fee_schedules.apply': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'feeId': ParamValue} }
    'fee_schedules.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'feeId': ParamValue} }
    'payments.get_students': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'payments.get_arrears': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'payments.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'payments.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'payments.get_allocations': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'paymentId': ParamValue} }
    'arrears.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'edu_tools.index': { paramsTuple?: []; params?: {} }
    'edu_tools.store': { paramsTuple?: []; params?: {} }
    'edu_tools.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'edu_tools.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'edu_tools.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'edu_tools.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'market.index': { paramsTuple?: []; params?: {} }
    'workspace.index': { paramsTuple?: []; params?: {} }
    'auth.auth_user': { paramsTuple?: []; params?: {} }
    'auth_v_2.user': { paramsTuple?: []; params?: {} }
    'webs.home': { paramsTuple?: []; params?: {} }
    'accesses.show': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'setup_wizards.show': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'dashboard.index': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'academic_years.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_periods.index': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'classes.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.search_students': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.get_uploads': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'fee_schedules.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'payments.get_students': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'payments.get_arrears': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'payments.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'payments.get_allocations': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'paymentId': ParamValue} }
    'arrears.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'edu_tools.index': { paramsTuple?: []; params?: {} }
    'edu_tools.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'market.index': { paramsTuple?: []; params?: {} }
    'workspace.index': { paramsTuple?: []; params?: {} }
    'auth.auth_user': { paramsTuple?: []; params?: {} }
    'auth_v_2.user': { paramsTuple?: []; params?: {} }
    'webs.home': { paramsTuple?: []; params?: {} }
    'accesses.show': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'setup_wizards.show': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'dashboard.index': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'academic_years.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_periods.index': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'classes.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.search_students': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.get_uploads': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'fee_schedules.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'payments.get_students': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'payments.get_arrears': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'payments.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'payments.get_allocations': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'paymentId': ParamValue} }
    'arrears.index': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'edu_tools.index': { paramsTuple?: []; params?: {} }
    'edu_tools.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'market.subscribe': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.verify': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth_v_2.signin': { paramsTuple?: []; params?: {} }
    'auth_v_2.verify_otp': { paramsTuple?: []; params?: {} }
    'auth_v_2.resend_otp': { paramsTuple?: []; params?: {} }
    'user_settings.set_password': { paramsTuple?: []; params?: {} }
    'user_settings.request_phone_change': { paramsTuple?: []; params?: {} }
    'user_settings.confirm_phone_change': { paramsTuple?: []; params?: {} }
    'academic_years.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_years.store_period': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicYearId': ParamValue} }
    'fee_schedules.synchronize': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'classes.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'classes.reorder': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'students.upload': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'fee_schedules.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'fee_schedules.apply': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'feeId': ParamValue} }
    'payments.store': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'edu_tools.store': { paramsTuple?: []; params?: {} }
  }
  OPTIONS: {
  }
  PUT: {
    'edu_tools.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'auth_v_2.complete_setup': { paramsTuple?: []; params?: {} }
    'user_settings.update_basic_details': { paramsTuple?: []; params?: {} }
    'user_settings.change_password': { paramsTuple?: []; params?: {} }
    'settings.update': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_years.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicYearId': ParamValue} }
    'academic_years.set_current_period': { paramsTuple: [ParamValue]; params: {'accessId': ParamValue} }
    'academic_years.update_period': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'classes.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'students.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'fee_schedules.update': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'feeId': ParamValue} }
    'edu_tools.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'academic_years.delete_year': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicYearId': ParamValue} }
    'academic_years.delete_period': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'academicPeriodId': ParamValue} }
    'classes.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'classId': ParamValue} }
    'students.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'studentId': ParamValue} }
    'fee_schedules.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'accessId': ParamValue,'feeId': ParamValue} }
    'edu_tools.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}