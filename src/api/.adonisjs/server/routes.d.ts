import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
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
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_v_2.user': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'auth_v_2.user': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth_v_2.signin': { paramsTuple?: []; params?: {} }
    'auth_v_2.verify_otp': { paramsTuple?: []; params?: {} }
    'auth_v_2.resend_otp': { paramsTuple?: []; params?: {} }
    'user_settings.set_password': { paramsTuple?: []; params?: {} }
    'user_settings.request_phone_change': { paramsTuple?: []; params?: {} }
    'user_settings.confirm_phone_change': { paramsTuple?: []; params?: {} }
  }
  OPTIONS: {
  }
  PUT: {
  }
  PATCH: {
    'auth_v_2.complete_setup': { paramsTuple?: []; params?: {} }
    'user_settings.update_basic_details': { paramsTuple?: []; params?: {} }
    'user_settings.change_password': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}