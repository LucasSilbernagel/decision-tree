import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { DecisionTree, DecisionTreeNode, NodePosition } from '~/types'
import { TREE_CONSTANTS } from '~/constants'
import { TreeTitle } from '~/components/TreeTitle/TreeTitle'
import { TreeVisualization } from '~/components/TreeVisualization/TreeVisualization'
import {
  calculateTreeDimensions,
  deserializeDecisionTree,
  serializeDecisionTree,
} from '~/lib/utils'
import { useLoaderData, useNavigate } from '@remix-run/react'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const treeData = url.searchParams.get('tree')
  return { treeData }
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree' },
    { name: 'description', content: 'A simple decision tree generator.' },
  ]
}

export default function Index() {
  const { treeData } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [decisionTree, setDecisionTree] = useState<DecisionTree | null>(null)
  const [treeWidth, setTreeWidth] = useState(0)
  const [treeHeight, setTreeHeight] = useState(0)
  const [treeTitleDraft, setTreeTitleDraft] = useState('')
  const [nodePositions, setNodePositions] = useState<Map<number, NodePosition>>(
    new Map()
  )
  const [highestId, setHighestId] = useState(0)
  const treeContainerRef = useRef<HTMLDivElement>(null)

  const lastSerializedState = useRef<string>('')
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

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
    if (treeData) {
      const loadedTree = deserializeDecisionTree(treeData)
      if (loadedTree) {
        setDecisionTree(loadedTree)
        lastSerializedState.current = treeData
      }
    }
  }, [treeData])

  // Debounced URL update when persistent state changes
  const updateURL = useCallback(
    (tree: DecisionTree) => {
      const serializedTree = serializeDecisionTree(tree)

      // Only update if the persistent state has changed
      if (serializedTree !== lastSerializedState.current) {
        lastSerializedState.current = serializedTree

        // Clear any pending update
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }

        // Schedule new update
        updateTimeoutRef.current = setTimeout(() => {
          navigate(`?tree=${serializedTree}`, { replace: true })
        }, 1000) // Delay URL update by 1 second
      }
    },
    [navigate]
  )

  // Update URL when tree changes (but not during editing)
  useEffect(() => {
    // Helper to check if any nodes are being edited
    const hasEditingNodes = (node: DecisionTreeNode): boolean => {
      if (node.text.isEditing) return true
      if (node.yes && hasEditingNodes(node.yes)) return true
      if (node.no && hasEditingNodes(node.no)) return true
      return false
    }
    if (decisionTree) {
      const shouldUpdateURL =
        !decisionTree.title.isEditing && !hasEditingNodes(decisionTree.node)

      if (shouldUpdateURL) {
        updateURL(decisionTree)
      }
    }
  }, [decisionTree, updateURL])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

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
