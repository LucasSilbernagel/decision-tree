import { useEffect, useRef } from 'react'
import { DecisionTreeNode } from '~/routes/_index'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { calculateTreeDimensions } from '~/lib/utils'

export type NodePosition = { x: number; y: number }

const TreeNode = ({
  node,
  updateNode,
  deleteNode,
  depth,
  xOffset,
  onPositionUpdate,
  getNewIds,
  containerRef,
}: {
  node: DecisionTreeNode
  updateNode: (newNode: DecisionTreeNode) => void
  deleteNode: (nodeId: number) => void
  depth: number
  xOffset: number
  onPositionUpdate: (id: number, position: NodePosition) => void
  getNewIds: () => { noId: number; yesId: number }
  containerRef: React.RefObject<HTMLDivElement>
}) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRef<NodePosition | null>(null)
  const verticalSpacing = 100

  // Calculate dimensions for current subtree
  const { width } = calculateTreeDimensions(node, depth)

  // Calculate child widths
  const noWidth = node.no
    ? calculateTreeDimensions(node.no, depth + 1).width
    : 0
  const yesWidth = node.yes
    ? calculateTreeDimensions(node.yes, depth + 1).width
    : 0

  const maxDepth = 4
  const maxNodesReached = depth >= maxDepth

  useEffect(() => {
    const currentContainer = containerRef.current
    const currentNode = nodeRef.current

    const updatePosition = () => {
      if (currentNode && currentContainer) {
        const nodeRect = currentNode.getBoundingClientRect()
        const containerRect = currentContainer.getBoundingClientRect()
        const newPosition = {
          x:
            nodeRect.left -
            containerRect.left +
            nodeRect.width / 2 +
            currentContainer.scrollLeft,
          y:
            nodeRect.top -
            containerRect.top +
            nodeRect.height / 2 +
            currentContainer.scrollTop,
        }

        const hasChanged =
          !prevPositionRef.current ||
          Math.abs(prevPositionRef.current.x - newPosition.x) > 1 ||
          Math.abs(prevPositionRef.current.y - newPosition.y) > 1

        if (hasChanged) {
          prevPositionRef.current = newPosition
          onPositionUpdate(node.id, newPosition)
        }
      }
    }

    const timeoutId = setTimeout(updatePosition, 50)

    const observer = new ResizeObserver(() => {
      setTimeout(updatePosition, 50)
    })

    if (currentNode) {
      observer.observe(currentNode)
    }

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [node.id, onPositionUpdate, containerRef])

  const handleAddChildren = () => {
    const { noId, yesId } = getNewIds()

    const newNode = {
      ...node,
      yes: {
        id: yesId,
        text: { value: 'Yes', isEditing: false },
        yes: null,
        no: null,
      },
      no: {
        id: noId,
        text: { value: 'No', isEditing: false },
        yes: null,
        no: null,
      },
    }

    updateNode(newNode)
  }

  const handleDelete = () => {
    deleteNode(node.id)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode({
      ...node,
      text: { ...node.text, value: e.target.value },
    })
  }

  return (
    <div
      className="relative"
      style={{
        width: `${width}px`,
        minHeight: `${verticalSpacing}px`,
      }}
    >
      <Card
        ref={nodeRef}
        className="left-1/2 absolute flex flex-col items-center border-gray-300 bg-gray-50 shadow-sm border rounded-lg w-[300px] transform -translate-x-1/2"
        style={{ top: `${depth * verticalSpacing}px` }}
      >
        <div className="w-full">
          <Label htmlFor={`condition-${node.id}`} className="sr-only">
            Condition {node.id}
          </Label>
          <Input
            className="w-full text-center text-xl"
            id={`condition-${node.id}`}
            value={node.text.value}
            onChange={handleTextChange}
            placeholder="Yes or no?"
          />
        </div>
        <div className="flex justify-between p-2 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={depth === 0}
            className={node.id < 3 ? 'invisible' : ''}
          >
            <Trash2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddChildren}
            className={
              node.id === 0 ||
              maxNodesReached ||
              (node.yes !== null && node.no !== null)
                ? 'invisible'
                : ''
            }
          >
            <Plus />
          </Button>
        </div>
      </Card>

      {node.no && (
        <div
          className="left-0 absolute"
          style={{
            top: `${verticalSpacing}px`,
            width: `${noWidth}px`,
          }}
        >
          <TreeNode
            node={node.no}
            updateNode={(newNoNode) => updateNode({ ...node, no: newNoNode })}
            deleteNode={deleteNode}
            depth={depth + 1}
            xOffset={xOffset - width / 4}
            onPositionUpdate={onPositionUpdate}
            getNewIds={getNewIds}
            containerRef={containerRef}
          />
        </div>
      )}

      {node.yes && (
        <div
          className="right-0 absolute"
          style={{
            top: `${verticalSpacing}px`,
            width: `${yesWidth}px`,
          }}
        >
          <TreeNode
            node={node.yes}
            updateNode={(newYesNode) =>
              updateNode({ ...node, yes: newYesNode })
            }
            deleteNode={deleteNode}
            depth={depth + 1}
            xOffset={xOffset + width / 4}
            onPositionUpdate={onPositionUpdate}
            getNewIds={getNewIds}
            containerRef={containerRef}
          />
        </div>
      )}
    </div>
  )
}

export default TreeNode
