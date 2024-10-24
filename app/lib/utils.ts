import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TREE_CONSTANTS } from '~/constants'
import { DecisionTreeNode } from '~/routes/_index'

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
