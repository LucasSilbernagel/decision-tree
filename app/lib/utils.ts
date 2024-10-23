import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DecisionTreeNode } from '~/routes/_index'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTreeDimensions = (
  node: DecisionTreeNode
): { width: number; height: number } => {
  const minNodeWidth = 300
  const verticalSpacing = 100

  if (!node) return { width: 0, height: 0 }

  const leftDimensions = node.no
    ? calculateTreeDimensions(node.no)
    : { width: 0, height: 0 }
  const rightDimensions = node.yes
    ? calculateTreeDimensions(node.yes)
    : { width: 0, height: 0 }

  const width = Math.max(
    minNodeWidth,
    leftDimensions.width +
      rightDimensions.width +
      (node.yes && node.no ? 50 : 0)
  )
  const height =
    Math.max(leftDimensions.height, rightDimensions.height) + verticalSpacing

  return { width, height }
}
