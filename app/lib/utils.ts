import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DecisionTreeNode } from '~/routes/_index'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTreeDimensions = (
  node: DecisionTreeNode,
  depth: number = 0
): { width: number; height: number } => {
  const minNodeWidth = 300
  const verticalSpacing = 100
  const horizontalSpacing = 100
  const widthMultiplier = 1.2

  if (!node) return { width: 0, height: 0 }

  const leftDimensions = node.no
    ? calculateTreeDimensions(node.no, depth + 1)
    : { width: 0, height: 0 }
  const rightDimensions = node.yes
    ? calculateTreeDimensions(node.yes, depth + 1)
    : { width: 0, height: 0 }

  const depthAdjustedWidth = minNodeWidth * Math.pow(widthMultiplier, depth)

  // Calculate total width needed for this subtree
  const width = Math.max(
    depthAdjustedWidth,
    leftDimensions.width + rightDimensions.width + horizontalSpacing
  )

  const height =
    Math.max(leftDimensions.height, rightDimensions.height) + verticalSpacing

  return { width, height }
}
