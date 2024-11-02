import DOMPurify from 'dompurify'
import { TREE_CONSTANTS } from '~/constants'
import {
  DecisionTree,
  DecisionTreeNode,
  SerializedNode,
  SerializedTree,
} from '~/types'

export const calculateTreeDimensions = (
  node: DecisionTreeNode,
  depth: number = 0
): { width: number; height: number } => {
  const {
    MIN_NODE_WIDTH,
    VERTICAL_SPACING,
    HORIZONTAL_SPACING,
    WIDTH_MULTIPLIER,
  } = TREE_CONSTANTS

  if (!node) return { width: 0, height: 0 }

  const leftDimensions = node.no
    ? calculateTreeDimensions(node.no, depth + 1)
    : { width: 0, height: 0 }
  const rightDimensions = node.yes
    ? calculateTreeDimensions(node.yes, depth + 1)
    : { width: 0, height: 0 }

  const depthAdjustedWidth = MIN_NODE_WIDTH * Math.pow(WIDTH_MULTIPLIER, depth)

  const width = Math.max(
    depthAdjustedWidth,
    leftDimensions.width + rightDimensions.width + HORIZONTAL_SPACING
  )

  const height =
    Math.max(leftDimensions.height, rightDimensions.height) + VERTICAL_SPACING

  return { width, height }
}

// Serialize decision tree to add it to the URL
export const serializeDecisionTree = (tree: DecisionTree): string => {
  const sanitizeNode = (
    node: DecisionTreeNode | null
  ): SerializedNode | null => {
    if (!node) return null
    return {
      id: node.id,
      text: DOMPurify.sanitize(node.text.value),
      yes: sanitizeNode(node.yes),
      no: sanitizeNode(node.no),
      parentId: node.parentId,
    }
  }

  const sanitizedTree: SerializedTree = {
    title: DOMPurify.sanitize(tree.title.value),
    node: sanitizeNode(tree.node)!,
  }

  return encodeURIComponent(JSON.stringify(sanitizedTree))
}

// Retrieve saved decision tree data from the URL
export const deserializeDecisionTree = (data: string): DecisionTree | null => {
  try {
    const parsed = JSON.parse(decodeURIComponent(data)) as SerializedTree

    const reconstructNode = (
      node: SerializedNode | null
    ): DecisionTreeNode | null => {
      if (!node) return null
      return {
        id: node.id,
        text: {
          value: DOMPurify.sanitize(node.text),
          isEditing: false,
        },
        yes: reconstructNode(node.yes),
        no: reconstructNode(node.no),
        parentId: node.parentId,
      }
    }

    return {
      title: {
        value: DOMPurify.sanitize(parsed.title),
        isEditing: false,
      },
      node: reconstructNode(parsed.node)!,
    }
  } catch (e) {
    console.error('Error deserializing tree:', e)
    return null
  }
}
