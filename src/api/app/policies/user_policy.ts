import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  //
  @allowGuest()
  view(user: User | null, model: User): AuthorizerResponse {
    return user?.id === model.id
  }
}
