import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TREE_CONSTANTS } from '~/constants'
import { DecisionTree, DecisionTreeNode } from '~/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export const getInitialTree = (): DecisionTreeNode => ({
  id: 0,
  text: { value: 'Yes or no?', isEditing: false },
  yes: {
    id: 1,
    text: { value: 'Yes', isEditing: false },
    yes: null,
    no: null,
    parentId: 0,
  },
  no: {
    id: 2,
    text: { value: 'No', isEditing: false },
    yes: null,
    no: null,
    parentId: 0,
  },
})

type SerializedNode = {
  id: number
  text: string
  yes: SerializedNode | null
  no: SerializedNode | null
  parentId?: number
}

type SerializedTree = {
  title: string
  node: SerializedNode
}

const getPersistentTreeState = (tree: DecisionTree): SerializedTree => ({
  title: tree.title.value,
  node: getPersistentNodeState(tree.node),
})

const getPersistentNodeState = (node: DecisionTreeNode): SerializedNode => ({
  id: node.id,
  text: node.text.value,
  yes: node.yes ? getPersistentNodeState(node.yes) : null,
  no: node.no ? getPersistentNodeState(node.no) : null,
  parentId: node.parentId,
})

export const serializeDecisionTree = (tree: DecisionTree): string => {
  const persistentState = getPersistentTreeState(tree)
  return encodeURIComponent(JSON.stringify(persistentState))
}

export const deserializeDecisionTree = (data: string): DecisionTree | null => {
  try {
    const parsed = JSON.parse(decodeURIComponent(data)) as SerializedTree

    const reconstructNode = (
      node: SerializedNode | null
    ): DecisionTreeNode | null => {
      if (!node) return null
      return {
        id: node.id,
        text: { value: node.text, isEditing: false },
        yes: reconstructNode(node.yes),
        no: reconstructNode(node.no),
        parentId: node.parentId,
      }
    }

    return {
      title: { value: parsed.title, isEditing: false },
      node: reconstructNode(parsed.node)!,
    }
  } catch (e) {
    console.error('Error deserializing tree:', e)
    return null
  }
}
