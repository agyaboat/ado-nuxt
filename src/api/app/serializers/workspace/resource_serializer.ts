import type EduToolAccess from '#models/edu_tool_access'
import type UserWorkspaceResource from '#models/user_workspace_resource'
import env from '#start/env'

export default class WorkspaceResourceSerializer {
  static serialize(resource: UserWorkspaceResource) {
    return {
      id: resource.id,

      resourceType: resource.resourceType,
      resourceId: resource.resourceId,

      label: resource.label,
      sublabel: resource.sublabel,
      description: resource.description,

      image: serializeImage(resource.image),

      sortOrder: resource.sortOrder,
      meta: resource.resourceType === 'tool' ? getToolMeta(resource.toolAccess) : null,
    }
  }
}

function getToolMeta(access: EduToolAccess) {
  return {
    key: access?.toolInstance?.tool?.key,
    accessId: access.id,
  }
}

interface WorkspaceImage {
  key?: string | null
}

export function serializeImage(image: WorkspaceImage) {
  return image?.key ? `${env.get('CDN_URL')}/${image.key}` : null
}
