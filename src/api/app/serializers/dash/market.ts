import type EduTool from '#models/edu_tool'
import { serializeImage } from '#serializers/workspace/resource_serializer'

export const serializeMarketTool = (tool: EduTool) => {
  return {
    id: tool.id,
    key: tool.key,
    label: tool.label,
    description: tool.description,

    type: tool.type,
    category: tool.category,

    isFeatured: tool.isFeatured,

    image: serializeImage(tool.image),
    meta: tool.meta,

    sortOrder: tool.sortOrder,

    createdAt: tool.createdAt,
    updatedAt: tool.updatedAt,
  }
}
