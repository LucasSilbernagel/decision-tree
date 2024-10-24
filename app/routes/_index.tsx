import type { MetaFunction } from '@remix-run/node'
import { useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { DecisionTreeNode, NodePosition } from '~/types'
import { TREE_CONSTANTS } from '~/constants'
import { TreeTitle } from '~/components/TreeTitle/TreeTitle'
import { TreeVisualization } from '~/components/TreeVisualization/TreeVisualization'
import { calculateTreeDimensions } from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree' },
    { name: 'description', content: 'A simple decision tree generator.' },
  ]
}

export type DecisionTree = {
  title: { value: string; isEditing: boolean }
  node: DecisionTreeNode
}

export default function Index() {
  const [decisionTree, setDecisionTree] = useState<DecisionTree | null>(null)
  const [treeWidth, setTreeWidth] = useState(0)
  const [treeHeight, setTreeHeight] = useState(0)
  const [treeTitleDraft, setTreeTitleDraft] = useState('')
  const [nodePositions, setNodePositions] = useState<Map<number, NodePosition>>(
    new Map()
  )
  const [highestId, setHighestId] = useState(0)
  const treeContainerRef = useRef<HTMLDivElement>(null)

  const createNewDecisionTree = () => {
    const initialWidth = TREE_CONSTANTS.MIN_NODE_WIDTH * 3 // Space for root and two children
    const initialHeight = TREE_CONSTANTS.VERTICAL_SPACING * 2 // Space for two levels

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

    setTreeWidth(initialWidth)
    setTreeHeight(initialHeight)
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

  useEffect(() => {
    if (decisionTree) {
      setHighestId((prevId) => {
        const findHighestId = (node: DecisionTreeNode): number => {
          if (!node) return prevId
          const yesMax = node.yes ? findHighestId(node.yes) : node.id
          const noMax = node.no ? findHighestId(node.no) : node.id
          return Math.max(node.id, yesMax, noMax)
        }
        return findHighestId(decisionTree.node)
      })
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
              <TreeTitle
                title={decisionTree.title}
                treeTitleDraft={treeTitleDraft}
                onTitleDraftChange={setTreeTitleDraft}
                onTitleEdit={handleTitleEdit}
              />
              <TreeVisualization
                node={decisionTree.node}
                treeHeight={treeHeight}
                treeWidth={treeWidth}
                updateTree={updateTree}
                deleteNode={deleteNode}
                onPositionUpdate={updateNodePosition}
                getNewIds={getNewIds}
                containerRef={treeContainerRef}
                nodePositions={nodePositions}
              />
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
