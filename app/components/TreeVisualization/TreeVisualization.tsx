import React, { useState, useCallback, useEffect, useRef } from 'react'
import { DecisionTreeNode, NodePosition } from '~/types'
import TreeNode from '~/components/TreeNode/TreeNode'
import { BackToStartButton } from '../BackToStartButton/BackToStartButton'

export type TreeVisualizationProps = {
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
  const [startX, setStartX] = useState<number>(0)
  const [startY, setStartY] = useState<number>(0)
  const [scrollLeft, setScrollLeft] = useState<number>(0)
  const [scrollTop, setScrollTop] = useState<number>(0)
  const [isRootVisible, setIsRootVisible] = useState(true)

  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 800
  const containerHeight = Math.max(viewportHeight - 200, treeHeight)

  const treeContentRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target instanceof SVGElement ||
        e.target instanceof HTMLDivElement
      ) {
        setIsDragging(true)
        if (containerRef.current) {
          setStartX(e.pageX - containerRef.current.offsetLeft)
          setStartY(e.pageY - containerRef.current.offsetTop)
          setScrollLeft(containerRef.current.scrollLeft)
          setScrollTop(containerRef.current.scrollTop)
          containerRef.current.style.cursor = 'grabbing'
        }
      }
    },
    [containerRef]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }, [containerRef])

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
    [isDragging, startX, startY, scrollLeft, scrollTop, containerRef]
  )

  const handleRootVisibilityChange = useCallback((isVisible: boolean) => {
    setIsRootVisible(isVisible)
  }, [])

  const scrollToRoot = useCallback(() => {
    if (containerRef.current) {
      const rootPos = nodePositions.get(0)
      if (rootPos) {
        containerRef.current.scrollTo({
          left: rootPos.x - containerRef.current.clientWidth / 2,
          top: 0,
          behavior: 'smooth',
        })
        window?.scrollTo(0, 0)
      }
    }
  }, [nodePositions, containerRef])

  const initialScrollDone = useRef(false)

  useEffect(() => {
    const rootPos = nodePositions.get(0)

    // Only scroll if we haven't scrolled yet AND we have the root position
    if (!initialScrollDone.current && rootPos) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            left: rootPos.x - containerRef.current.clientWidth / 2,
            top: 0,
            behavior: 'smooth',
          })
          window?.scrollTo(0, 0)
          initialScrollDone.current = true
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [nodePositions, containerRef])

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
            <g key={`${node.id}-${node.yes.id}-yes-group`} role="presentation">
              <line
                x1={parentPos.x}
                y1={parentPos.y + 40}
                x2={yesPos.x}
                y2={yesPos.y - 40}
                stroke="green"
                strokeWidth="3"
                strokeDasharray="10,5"
                aria-hidden="true"
              />
              <circle
                cx={midX}
                cy={midY}
                r="16"
                fill="white"
                stroke="black"
                strokeWidth="1"
                aria-hidden="true"
              />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fill="black"
                fontWeight="bold"
                aria-hidden="true"
              >
                Yes
              </text>
            </g>
          )
          lines.push(elements)
          renderLinesRecursive(node.yes)
        }
      }

      if (node.no) {
        const noPos = nodePositions.get(node.no.id)
        if (noPos) {
          // Calculate midpoint for text positioning
          const midX = (parentPos.x + noPos.x) / 2
          const midY = (parentPos.y + 40 + noPos.y - 40) / 2

          const elements = (
            <g key={`${node.id}-${node.no.id}-no-group`} role="presentation">
              <line
                x1={parentPos.x}
                y1={parentPos.y + 40}
                x2={noPos.x}
                y2={noPos.y - 40}
                stroke="red"
                strokeWidth="3"
                strokeDasharray="10,5,2,5"
                aria-hidden="true"
              />
              <circle
                cx={midX}
                cy={midY}
                r="16"
                fill="white"
                stroke="black"
                strokeWidth="1"
                aria-hidden="true"
              />
              <text
                x={midX}
                y={midY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fill="black"
                fontWeight="bold"
                aria-hidden="true"
              >
                No
              </text>
            </g>
          )
          lines.push(elements)
          renderLinesRecursive(node.no)
        }
      }
    }

    renderLinesRecursive(node)
    return lines
  }

  return (
    <div role="application" aria-label="Decision Tree Visualization">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="region"
        aria-label="Decision tree navigation area"
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
          aria-hidden="true"
        >
          <svg
            width="100%"
            height="100%"
            style={{
              pointerEvents: 'none',
            }}
            role="presentation"
          >
            <defs>
              <pattern
                id="large-dot-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="4" cy="4" r="2" fill="#e5e7eb" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#large-dot-pattern)" />
            {renderLines()}
          </svg>
        </div>
        <div
          ref={treeContentRef}
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
              onRootVisibilityChange={handleRootVisibilityChange}
            />
          </div>
        </div>
      </div>
      {!isRootVisible && <BackToStartButton onClick={scrollToRoot} />}
    </div>
  )
}
