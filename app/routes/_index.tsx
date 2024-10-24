import type { MetaFunction } from '@remix-run/node'
import { Pencil, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import TreeNode, { NodePosition } from '~/components/TreeNode/TreeNode'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { calculateTreeDimensions } from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree' },
    { name: 'description', content: 'A simple decision tree generator.' },
  ]
}

export type DecisionTreeNode = {
  id: number
  text: { value: string; isEditing: boolean }
  yes: DecisionTreeNode | null
  no: DecisionTreeNode | null
  parentId?: number
}

export default function Index() {
  const [decisionTree, setDecisionTree] = useState<{
    title: { value: string; isEditing: boolean }
    node: DecisionTreeNode
  } | null>(null)

  const [treeWidth, setTreeWidth] = useState(0)
  const [treeHeight, setTreeHeight] = useState(0)

  const [treeTitleDraft, setTreeTitleDraft] = useState(
    decisionTree?.title.value || ''
  )

  const [nodePositions, setNodePositions] = useState<Map<number, NodePosition>>(
    new Map()
  )
  const [highestId, setHighestId] = useState(0)

  const treeContainerRef = useRef<HTMLDivElement>(null)

  const createNewDecisionTree = () => {
    setDecisionTree({
      title: { value: 'Decision Tree Title', isEditing: false },
      node: {
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
      },
    })
  }

  const updateTree = (newNode: DecisionTreeNode) => {
    if (decisionTree) {
      const oldPositions = new Map(nodePositions)
      setDecisionTree({
        ...decisionTree,
        node: newNode,
      })
      setNodePositions(oldPositions)
    }
  }

  const handleTitleEdit = () => {
    if (decisionTree) {
      setDecisionTree({
        ...decisionTree,
        title: {
          value: treeTitleDraft || 'Decision Tree Title',
          isEditing: !decisionTree.title.isEditing,
        },
      })
    }
  }

  const deleteNode = (nodeId: number) => {
    if (decisionTree) {
      const deleteNodeRecursive = (
        node: DecisionTreeNode | null
      ): DecisionTreeNode | null => {
        if (!node) return null
        if (node.id === nodeId) return null
        return {
          ...node,
          yes: deleteNodeRecursive(node.yes),
          no: deleteNodeRecursive(node.no),
        }
      }
      const updatedTree = deleteNodeRecursive(decisionTree.node)
      if (updatedTree) {
        setDecisionTree({
          ...decisionTree,
          node: updatedTree,
        })
      }
    }
  }

  const updateNodePosition = (id: number, position: NodePosition) => {
    setNodePositions((prev) => {
      const newPositions = new Map(prev)
      newPositions.set(id, position)
      return newPositions
    })
  }

  const getNewIds = () => {
    const noId = highestId + 1
    const yesId = noId + 1
    setHighestId(yesId)
    return { noId, yesId }
  }

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
              {/* Text label */}
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
              {/* Text label */}
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

    if (decisionTree?.node) {
      renderLinesRecursive(decisionTree.node)
    }

    return lines
  }

  useEffect(() => {
    const getHighestId = (
      node: DecisionTreeNode | null,
      depth = 0,
      xOffset = 0,
      positions: { id: number; x: number; y: number; parentId?: number }[] = [],
      parentId?: number
    ): {
      highestId: number
      positions: { id: number; x: number; y: number; parentId?: number }[]
    } => {
      if (node === null) {
        return { highestId: -1, positions }
      }
      const yesResult = node.yes
        ? getHighestId(node.yes, depth + 1, xOffset - 50, positions, node.id)
        : { highestId: -1, positions }
      const noResult = node.no
        ? getHighestId(node.no, depth + 1, xOffset + 50, positions, node.id)
        : { highestId: -1, positions }
      positions.push({
        id: node.id,
        x: xOffset,
        y: depth * 100,
        parentId,
      })
      return {
        highestId: Math.max(node.id, yesResult.highestId, noResult.highestId),
        positions,
      }
    }

    if (decisionTree) {
      const { highestId } = getHighestId(decisionTree.node)
      setHighestId(highestId)
      setTreeTitleDraft(decisionTree.title.value)
      const { width, height } = calculateTreeDimensions(decisionTree.node)
      setTreeWidth(width)
      setTreeHeight(height)
    }
  }, [decisionTree])

  useEffect(() => {
    const handleResize = () => {
      if (treeContainerRef.current) {
        const containerWidth = treeContainerRef.current.offsetWidth
        const leftMargin = Math.max(0, (containerWidth - treeWidth) / 2)
        treeContainerRef.current.style.marginLeft = `${leftMargin}px`
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [treeWidth])

  return (
    <div className="mx-auto pt-12 text-center">
      <header>
        <h1 className="sr-only">Decision Tree</h1>
      </header>
      <main className="w-full overflow-hidden">
        <div>
          {decisionTree ? (
            <>
              <div className="flex justify-center items-center gap-6 mb-6">
                <div>
                  {decisionTree.title.isEditing ? (
                    <>
                      <Label htmlFor="decisionTreeTitle" className="sr-only">
                        Decision Tree Title
                      </Label>
                      <Input
                        id="decisionTreeTitle"
                        value={treeTitleDraft}
                        placeholder="Decision Tree Title"
                        onChange={(e) => setTreeTitleDraft(e.target.value)}
                        className="text-4xl text-center"
                      />
                    </>
                  ) : (
                    <h2 className="text-4xl text-center">
                      {decisionTree.title.value}
                    </h2>
                  )}
                </div>
                <div>
                  <Button variant="ghost" size="icon" onClick={handleTitleEdit}>
                    {decisionTree.title.isEditing ? <Save /> : <Pencil />}
                  </Button>
                </div>
              </div>

              <div
                className="relative w-full overflow-auto"
                style={{ height: '800px' }}
                ref={treeContainerRef}
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
                    node={decisionTree.node}
                    updateNode={updateTree}
                    deleteNode={deleteNode}
                    depth={0}
                    xOffset={0}
                    onPositionUpdate={updateNodePosition}
                    getNewIds={getNewIds}
                    containerRef={treeContainerRef}
                  />
                </div>
              </div>
            </>
          ) : (
            <Button onClick={createNewDecisionTree}>
              Create a new decision tree
            </Button>
          )}
        </div>
      </main>
      <footer className="mt-12">
        <p>Footer</p>
      </footer>
    </div>
  )
}
