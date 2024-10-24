import React, { useState, useCallback } from 'react'
import { DecisionTreeNode, NodePosition } from '~/types'
import TreeNode from '~/components/TreeNode/TreeNode'

interface TreeVisualizationProps {
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
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 800
  const containerHeight = Math.max(viewportHeight - 200, treeHeight)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target instanceof SVGElement || e.target instanceof HTMLDivElement) {
      setIsDragging(true)
      if (containerRef.current) {
        setStartX(e.pageX - containerRef.current.offsetLeft)
        setStartY(e.pageY - containerRef.current.offsetTop)
        setScrollLeft(containerRef.current.scrollLeft)
        setScrollTop(containerRef.current.scrollTop)
        containerRef.current.style.cursor = 'grabbing'
      }
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      e.preventDefault()
      const x = e.pageX - containerRef.current.offsetLeft
      const y = e.pageY - containerRef.current.offsetTop

      const walkX = (x - startX) * 1.5
      const walkY = (y - startY) * 1.5

      containerRef.current.scrollLeft = scrollLeft - walkX
      containerRef.current.scrollTop = scrollTop - walkY
    },
    [isDragging, startX, startY, scrollLeft, scrollTop]
  )

  const renderLines = () => {
    const lines: JSX.Element[] = []

    const renderLinesRecursive = (node: DecisionTreeNode | null) => {
      if (!node) return

      const parentPos = nodePositions.get(node.id)
      if (!parentPos) return

      if (node.yes) {
        const yesPos = nodePositions.get(node.yes.id)
        if (yesPos) {
          // Calculate midpoint for text positioning
          const midX = (parentPos.x + yesPos.x) / 2
          const midY = (parentPos.y + 40 + yesPos.y - 40) / 2

          const elements = (
            <g key={`${node.id}-${node.yes.id}-yes-group`}>
              <line
                x1={parentPos.x}
                y1={parentPos.y + 40}
                x2={yesPos.x}
                y2={yesPos.y - 40}
                stroke="green"
                strokeWidth="3"
                strokeDasharray="10,5"
              />
              <circle
                cx={midX}
                cy={midY}
                r="16"
                fill="white"
                stroke="black"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fill="black"
                fontWeight="bold"
              >
                Yes
              </text>
            </g>
          )
          lines.push(elements)
        }
        renderLinesRecursive(node.yes)
      }

      if (node.no) {
        const noPos = nodePositions.get(node.no.id)
        if (noPos) {
          // Calculate midpoint for text positioning
          const midX = (parentPos.x + noPos.x) / 2
          const midY = (parentPos.y + 40 + noPos.y - 40) / 2

          const elements = (
            <g key={`${node.id}-${node.no.id}-no-group`}>
              <line
                x1={parentPos.x}
                y1={parentPos.y + 40}
                x2={noPos.x}
                y2={noPos.y - 40}
                stroke="red"
                strokeWidth="3"
                strokeDasharray="10,5,2,5"
              />
              <circle
                cx={midX}
                cy={midY}
                r="16"
                fill="white"
                stroke="black"
                strokeWidth="1"
              />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fill="black"
                fontWeight="bold"
              >
                No
              </text>
            </g>
          )
          lines.push(elements)
        }
        renderLinesRecursive(node.no)
      }
    }

    renderLinesRecursive(node)
    return lines
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="relative w-full overflow-auto select-none"
      style={{
        height: `${containerHeight}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="top-0 left-0 absolute w-full h-full"
        style={{
          minHeight: `${Math.max(treeHeight * 2, containerHeight)}px`,
          minWidth: `${treeWidth * 1.1}px`,
          pointerEvents: 'none',
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            pointerEvents: 'none',
          }}
        >
          {renderLines()}
        </svg>
      </div>
      <div
        className="relative px-4 md:px-12 min-w-full"
        style={{
          pointerEvents: 'none',
          minHeight: `${Math.max(treeHeight * 2, containerHeight)}px`,
        }}
      >
        <div style={{ pointerEvents: 'all' }}>
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
    </div>
  )
}
