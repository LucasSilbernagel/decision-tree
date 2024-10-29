import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { DecisionTree, DecisionTreeNode, NodePosition } from '~/types'
import { EXAMPLE_TREE, TREE_CONSTANTS } from '~/constants'
import { TreeTitle } from '~/components/TreeTitle/TreeTitle'
import { TreeVisualization } from '~/components/TreeVisualization/TreeVisualization'
import {
  calculateTreeDimensions,
  deserializeDecisionTree,
  serializeDecisionTree,
} from '~/lib/utils'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { useToast } from '~/hooks/use-toast'
import { Share2 } from 'lucide-react'
import { DeleteTreeDialog } from '~/components/DeleteTreeDialog/DeleteTreeDialog'
import DOMPurify from 'dompurify'
import Footer from '~/components/Footer/Footer'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const treeData = url.searchParams.get('tree')
  return { treeData }
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree' },
    {
      name: 'description',
      content: 'A simple generator of shareable decision trees.',
    },
    {
      property: 'og:image',
      content: '/decision-tree.png',
    },
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

  const { toast } = useToast()

  const createNewDecisionTree = () => {
    const initialWidth = TREE_CONSTANTS.MIN_NODE_WIDTH * 3
    const initialHeight = TREE_CONSTANTS.VERTICAL_SPACING * 2

    const newTree = {
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
    }

    setDecisionTree(newTree)
    setTreeWidth(initialWidth)
    setTreeHeight(initialHeight)

    // Immediately update URL with the new tree
    const serializedTree = serializeDecisionTree(newTree)
    lastSerializedState.current = serializedTree
    navigate(`?tree=${serializedTree}`, { replace: true })
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
          value: DOMPurify.sanitize(treeTitleDraft) || 'Decision Tree Title',
          isEditing: !decisionTree.title.isEditing,
        },
      })
    }
  }

  const deleteNode = (nodeId: number) => {
    if (decisionTree) {
      const deletedIds: number[] = []

      const deleteNodeRecursive = (
        node: DecisionTreeNode | null
      ): DecisionTreeNode | null => {
        if (!node) return null
        if (node.id === nodeId) {
          // Add this node and all its children to deletedIds
          const collectNodeIds = (n: DecisionTreeNode) => {
            deletedIds.push(n.id)
            if (n.yes) collectNodeIds(n.yes)
            if (n.no) collectNodeIds(n.no)
          }
          collectNodeIds(node)
          return null
        }
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

        // Remove all deleted node positions
        setNodePositions((prevPositions) => {
          const newPositions = new Map(prevPositions)
          deletedIds.forEach((id) => {
            newPositions.delete(id)
          })
          return newPositions
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: `URL copied to clipboard!` })
    } catch (err) {
      toast({ title: `Failed to copy URL`, variant: 'destructive' })
      console.error('Failed to copy URL:', err)
    }
  }

  const handleReset = () => {
    setDecisionTree(null)
    navigate('/', { replace: true })
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
    <div className="mx-auto pt-6 text-center">
      <header>
        <h1 className="sr-only">Decision Tree</h1>
      </header>
      <main className="w-full overflow-hidden">
        <div>
          {decisionTree ? (
            <>
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Tree
                </Button>
                <DeleteTreeDialog handleReset={handleReset} />
              </div>
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
            <div className="min-h-[550px]">
              <div className="flex sm:flex-row flex-col justify-center gap-4 mb-6 px-4 sm:px-0">
                <Button
                  onClick={() =>
                    navigate(`?tree=${EXAMPLE_TREE}`, { replace: true })
                  }
                >
                  View an example decision tree
                </Button>
                <Button onClick={createNewDecisionTree}>
                  Create a new decision tree
                </Button>
              </div>
              <div className="my-12">
                <div className="flex justify-center mb-12 w-full">
                  <div className="max-w-[200px]">
                    <img src="/tree.webp" alt="" />
                  </div>
                </div>
                <p className="text-xl">
                  A simple generator of shareable decision trees.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
