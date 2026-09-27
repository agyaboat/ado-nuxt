// import type { HttpContext } from '@adonisjs/core/http'

// // import EduToolSubscription from '#models/edu_tool_subscription'

// function serializeToolRuntime(subscription: EduToolSubscription) {
//   const tool = subscription.tool
//   const school = subscription.school

//   return {
//     subscription: {
//       id: subscription.id,
//       status: subscription.status,

//       schoolId: subscription.schoolId,

//       subscriberType: subscription.subscriberType,
//       subscriberId: subscription.subscriberId,

//       source: subscription.source,

//       entitlements: subscription.entitlements,
//       config: subscription.config,
//       meta: subscription.meta,
//     },

//     tool: {
//       id: tool.id,
//       key: tool.key,
//       label: tool.label,
//       description: tool.description,

//       type: tool.type,
//       category: tool.category,

//       image: tool.image,
//       meta: tool.meta,
//     },

//     school: school
//       ? {
//           id: school.id,
//           name: school.name,
//           slug: school.slug,
//           code: school.code,
//         }
//       : null,

//     requiresSetup: subscription.status === 'pending_setup' || !subscription.schoolId,

//     setupRequirements: tool.requirements,
//   }
// }

// export default class RuntimeController {
//   async show({ auth, params, response }: HttpContext) {
//     const user = auth.use('web').user

//     if (!user) {
//       return response.unauthorized({ message: 'Unauthorized' })
//     }

//     const subscription = await EduToolSubscription.query()
//       .where('id', params.id)
//       .where('subscriber_type', 'user')
//       .where('subscriber_id', user.userId)
//       .preload('tool')
//       .preload('school')
//       .first()

//     if (!subscription) {
//       return response.notFound({
//         message: 'Tool subscription not found.',
//       })
//     }

//     return {
//       data: serializeToolRuntime(subscription),
//     }
//   }
// }
