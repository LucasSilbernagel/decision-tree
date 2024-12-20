import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DecisionTree, DecisionTreeNode, NodePosition } from '~/types'
import { useLoaderData, useNavigate } from '@remix-run/react'
import Footer from '~/components/Footer/Footer'
import EmptyTree from '~/components/EmptyTree/EmptyTree'
import FullTree from '~/components/FullTree/FullTree'
import {
  calculateTreeDimensions,
  deserializeDecisionTree,
  serializeDecisionTree,
} from '~/utils'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree | Home' },
    {
      name: 'description',
      content:
        'Decision Tree is a simple generator of shareable and accessible decision trees. Decision tree data is serialized and saved in the URL, making it easy to share and save created decision trees.',
    },
    {
      property: 'og:image',
      content: '/decision-tree.png',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  // Retrieve saved decision tree state from the URL
  const treeData = url.searchParams.get('tree')
  return { treeData }
}

export default function Index() {
  const { treeData } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  const [decisionTree, setDecisionTree] = useState<DecisionTree | null>(null)
  const [nodePositions, setNodePositions] = useState<Map<number, NodePosition>>(
    new Map()
  )

  const treeContainerRef = useRef<HTMLDivElement>(null)
  const lastSerializedState = useRef<string>('')
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Retrieve saved decision tree state from the URL
    if (treeData) {
      const loadedTree = deserializeDecisionTree(treeData)
      if (loadedTree) {
        setDecisionTree(loadedTree)
        lastSerializedState.current = treeData
      }
    }
  }, [treeData])

  // Update center alignment when tree changes
  useEffect(() => {
    const handleResize = () => {
      if (treeContainerRef.current && decisionTree) {
        const { width } = calculateTreeDimensions(decisionTree.node)
        const containerWidth = treeContainerRef.current.offsetWidth
        const leftMargin = Math.max(0, (containerWidth - width) / 2)
        treeContainerRef.current.style.marginLeft = `${leftMargin}px`
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [decisionTree])

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

  return (
    <div className="mx-auto pt-6 text-center">
      <header>
        <h1 className="sr-only">Decision Tree</h1>
      </header>
      <main className="w-full overflow-hidden">
        <div>
          {decisionTree ? (
            <FullTree
              decisionTree={decisionTree}
              setDecisionTree={setDecisionTree}
              nodePositions={nodePositions}
              setNodePositions={setNodePositions}
              treeContainerRef={treeContainerRef}
            />
          ) : (
            <EmptyTree
              setDecisionTree={setDecisionTree}
              lastSerializedState={lastSerializedState}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
