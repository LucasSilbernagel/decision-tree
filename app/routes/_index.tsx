import type { MetaFunction } from '@remix-run/node'
import { Pencil, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import TreeNode, { NodePosition } from '~/components/TreeNode/TreeNode'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

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

const minNodeWidth = 300
const verticalSpacing = 100

// Add this function at the top level, before your Index component
export const calculateTreeDimensions = (
  node: DecisionTreeNode
): { width: number; height: number } => {
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

export default function Index() {
  const [decisionTree, setDecisionTree] = useState<{
    title: { value: string; isEditing: boolean }
    node: DecisionTreeNode
  } | null>(null)

  const [treeWidth, setTreeWidth] = useState(0)

  const [decisionTreeTitleDraft, setDecisionTreeTitleDraft] = useState(
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
        },
        no: {
          id: 2,
          text: { value: 'No', isEditing: false },
          yes: null,
          no: null,
        },
      },
    })
    setHighestId(0)
  }

  const updateTree = (newNode: DecisionTreeNode) => {
    console.log('Updating tree with node:', newNode)
    if (decisionTree) {
      setDecisionTree({
        ...decisionTree,
        node: newNode,
      })
    }
  }

  const handleTitleEdit = () => {
    if (decisionTree) {
      setDecisionTree({
        ...decisionTree,
        title: {
          value: decisionTreeTitleDraft || 'Decision Tree Title',
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
    console.log('Updating position for node:', { id, position })
    setNodePositions((prev) => {
      const newPositions = new Map(prev)
      newPositions.set(id, position)
      console.log(
        'Updated nodePositions Map:',
        Array.from(newPositions.entries())
      )
      return newPositions
    })
  }

  const getNewId = (() => {
    let nextId = 2 // Start at 2 since we already have IDs 0, 1, 2 in initial tree
    return () => {
      nextId += 1
      // Update state for tracking but don't rely on it for ID generation
      setHighestId(Math.max(highestId, nextId))
      return nextId
    }
  })()

  const renderLines = () => {
    const lines: JSX.Element[] = []

    console.log(
      'Current nodePositions Map:',
      Array.from(nodePositions.entries()).map(([id, pos]) => ({
        id,
        x: pos.x,
        y: pos.y,
      }))
    )

    const renderLinesRecursive = (node: DecisionTreeNode | null, depth = 0) => {
      if (!node) return

      console.log(`Processing node at depth ${depth}:`, {
        id: node.id,
        text: node.text.value,
        hasYes: !!node.yes,
        hasNo: !!node.no,
      })

      const parentPos = nodePositions.get(node.id)

      if (!parentPos) {
        console.warn(`Missing position for node ${node.id}`)
        return
      }

      // Handle Yes branch
      if (node.yes) {
        const yesPos = nodePositions.get(node.yes.id)
        if (!yesPos) {
          console.warn(
            `Missing position for YES child of node ${node.id} (child id: ${node.yes.id})`
          )
        } else {
          console.log(
            `Drawing YES line from node ${node.id} to ${node.yes.id}`,
            {
              from: parentPos,
              to: yesPos,
            }
          )
          lines.push(
            <line
              key={`${node.id}-${node.yes.id}-yes`}
              x1={parentPos.x}
              y1={parentPos.y + 40}
              x2={yesPos.x}
              y2={yesPos.y - 40}
              stroke="black"
            />
          )
        }
        renderLinesRecursive(node.yes, depth + 1)
      }

      // Handle No branch
      if (node.no) {
        const noPos = nodePositions.get(node.no.id)
        if (!noPos) {
          console.warn(
            `Missing position for NO child of node ${node.id} (child id: ${node.no.id})`
          )
        } else {
          console.log(`Drawing NO line from node ${node.id} to ${node.no.id}`, {
            from: parentPos,
            to: noPos,
          })
          lines.push(
            <line
              key={`${node.id}-${node.no.id}-no`}
              x1={parentPos.x}
              y1={parentPos.y + 40}
              x2={noPos.x}
              y2={noPos.y - 40}
              stroke="black"
            />
          )
        }
        renderLinesRecursive(node.no, depth + 1)
      }
    }

    if (decisionTree?.node) {
      console.log('Starting tree traversal with root node:', decisionTree.node)
      renderLinesRecursive(decisionTree.node)
    }

    console.log('Final lines to be rendered:', lines.length)
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
      setDecisionTreeTitleDraft(decisionTree.title.value)
      const { width } = calculateTreeDimensions(decisionTree.node)
      setTreeWidth(width)
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
                        value={decisionTreeTitleDraft}
                        placeholder="Decision Tree Title"
                        onChange={(e) =>
                          setDecisionTreeTitleDraft(e.target.value)
                        }
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
                style={{ height: '500px' }}
                ref={treeContainerRef}
              >
                <svg
                  width="100%"
                  height="100%"
                  className="top-0 left-0 absolute pointer-events-none"
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
                    getNewId={getNewId}
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
