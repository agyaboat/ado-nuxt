import type EduTool from '#models/edu_tool'
import { serializeImage } from '#serializers/workspace/resource_serializer'

export function serializeEduTool(tool: EduTool) {
  return {
    id: tool.id,

    key: tool.key,
    label: tool.label,
    description: tool.description,

    type: tool.type,
    category: tool.category,
    status: tool.status,

    isMarketVisible: tool.isMarketVisible,
    isFeatured: tool.isFeatured,
    sortOrder: tool.sortOrder,

    image: serializeImage(tool.image),

    standardPricePerMonth: tool.standardPricePerMonth,
    proPricePerMonth: tool.proPricePerMonth,
    proAvailable: tool.proAvailable,

    defaultConfig: tool.defaultConfig,
    meta: tool.meta,

    instancesCount: Number(tool.$extras.instancesCount || 0),
    activeInstancesCount: Number(tool.$extras.activeInstancesCount || 0),

    createdByUserId: tool.createdByUserId,

    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
  }
}
