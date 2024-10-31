import { useToast } from '~/hooks/use-toast'
import { Button } from '../ui/button'
import { Share2 } from 'lucide-react'
import { DeleteTreeDialog } from '../DeleteTreeDialog/DeleteTreeDialog'
import { DecisionTree, DecisionTreeNode, NodePosition } from '~/types'
import { useNavigate } from '@remix-run/react'
import { TreeTitle } from '../TreeTitle/TreeTitle'
import { TreeVisualization } from '../TreeVisualization/TreeVisualization'
import DOMPurify from 'dompurify'
import { Dispatch, RefObject, SetStateAction } from 'react'

type FullTreeProps = {
  decisionTree: DecisionTree
  setDecisionTree: (tree: DecisionTree | null) => void
  treeTitle: string
  setTreeTitle: Dispatch<SetStateAction<string>>
  treeHeight: number
  treeWidth: number
  nodePositions: Map<number, NodePosition>
  setNodePositions: React.Dispatch<
    React.SetStateAction<Map<number, NodePosition>>
  >
  highestNodeId: number
  setHighestNodeId: Dispatch<SetStateAction<number>>
  treeContainerRef: RefObject<HTMLDivElement>
}

const FullTree = ({
  decisionTree,
  setDecisionTree,
  treeTitle,
  setTreeTitle,
  treeHeight,
  treeWidth,
  nodePositions,
  setNodePositions,
  highestNodeId,
  setHighestNodeId,
  treeContainerRef,
}: FullTreeProps) => {
  const { toast } = useToast()
  const navigate = useNavigate()

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

  const handleTitleEdit = () => {
    if (decisionTree) {
      setDecisionTree({
        ...decisionTree,
        title: {
          value: DOMPurify.sanitize(treeTitle) || 'Decision Tree Title',
          isEditing: !decisionTree.title.isEditing,
        },
      })
    }
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
    const noId = highestNodeId + 1
    const yesId = noId + 1
    setHighestNodeId(yesId)
    return { noId, yesId }
  }

  return (
    <>
      <div className="flex justify-center gap-4 mt-1 mb-6">
        <Button onClick={handleShare} className="flex items-center gap-2">
          <Share2 className="mr-1.5 w-4 h-4" />
          Share Tree
        </Button>
        <DeleteTreeDialog handleReset={handleReset} />
      </div>
      <TreeTitle
        title={decisionTree.title}
        treeTitle={treeTitle}
        onTitleDraftChange={setTreeTitle}
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
  )
}

export default FullTree
