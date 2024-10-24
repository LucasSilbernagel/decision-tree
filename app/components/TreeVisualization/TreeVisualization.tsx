import React from 'react'
import { DecisionTreeNode, NodePosition } from '~/types'
import TreeNode from '~/components/TreeNode/TreeNode'
import { TreeLine } from '../TreeLine/TreeLine'

type TreeVisualizationProps = {
  node: DecisionTreeNode
  treeHeight: number
  treeWidth: number
  nodePositions: Map<number, NodePosition>
  updateTree: (newNode: DecisionTreeNode) => void
  deleteNode: (nodeId: number) => void
  onPositionUpdate: (id: number, position: NodePosition) => void
  getNewIds: () => { noId: number; yesId: number }
  containerRef: React.RefObject<HTMLDivElement>
}

export const TreeVisualization: React.FC<TreeVisualizationProps> = ({
  node,
  treeHeight,
  treeWidth,
  nodePositions,
  updateTree,
  deleteNode,
  onPositionUpdate,
  getNewIds,
  containerRef,
}) => {
  const renderLines = () => {
    const lines: JSX.Element[] = []

    const renderLinesRecursive = (node: DecisionTreeNode | null) => {
      if (!node) return

      const parentPos = nodePositions.get(node.id)
      if (!parentPos) return

      if (node.yes) {
        const yesPos = nodePositions.get(node.yes.id)
        if (yesPos) {
          lines.push(
            <TreeLine
              key={`${node.id}-${node.yes.id}-yes`}
              startPos={parentPos}
              endPos={yesPos}
              type="yes"
            />
          )
        }
        renderLinesRecursive(node.yes)
      }

      if (node.no) {
        const noPos = nodePositions.get(node.no.id)
        if (noPos) {
          lines.push(
            <TreeLine
              key={`${node.id}-${node.no.id}-no`}
              startPos={parentPos}
              endPos={noPos}
              type="no"
            />
          )
        }
        renderLinesRecursive(node.no)
      }
    }

    renderLinesRecursive(node)
    return lines
  }

  return (
    <div
      className="relative w-full overflow-auto"
      style={{ height: '800px' }}
      ref={containerRef}
    >
      <svg
        width="100%"
        height="100%"
        className="top-0 left-0 absolute pointer-events-none"
        style={{
          minHeight: `${treeHeight * 2}px`,
          minWidth: `${treeWidth * 1.1}px`,
        }}
      >
        {renderLines()}
      </svg>
      <div className="inline-block px-4 md:px-12 min-w-full transition-all duration-300 ease-in-out">
        <TreeNode
          node={node}
          updateNode={updateTree}
          deleteNode={deleteNode}
          depth={0}
          xOffset={0}
          onPositionUpdate={onPositionUpdate}
          getNewIds={getNewIds}
          containerRef={containerRef}
        />
      </div>
    </div>
  )
}
