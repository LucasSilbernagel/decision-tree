import { useEffect, useRef } from 'react'
import { calculateTreeDimensions, DecisionTreeNode } from '~/routes/_index'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'

export type NodePosition = { x: number; y: number }

const TreeNode = ({
  node,
  updateNode,
  deleteNode,
  depth,
  xOffset,
  onPositionUpdate,
  getNewId,
  containerRef,
}: {
  node: DecisionTreeNode
  updateNode: (newNode: DecisionTreeNode) => void
  deleteNode: (nodeId: number) => void
  depth: number
  xOffset: number
  onPositionUpdate: (id: number, position: NodePosition) => void
  getNewId: () => number
  containerRef: React.RefObject<HTMLDivElement>
}) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRef<NodePosition | null>(null)
  const verticalSpacing = 100

  const { width } = calculateTreeDimensions(node)

  useEffect(() => {
    const updatePosition = () => {
      if (nodeRef.current && containerRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const newPosition = {
          x:
            nodeRect.left -
            containerRect.left +
            nodeRect.width / 2 +
            containerRef.current.scrollLeft,
          y:
            nodeRect.top -
            containerRect.top +
            nodeRect.height / 2 +
            containerRef.current.scrollTop,
        }

        // Only update if the position has changed
        if (
          JSON.stringify(newPosition) !==
          JSON.stringify(prevPositionRef.current)
        ) {
          prevPositionRef.current = newPosition
          onPositionUpdate(node.id, newPosition)
        }
      }
    }

    updatePosition()

    const resizeObserver = new ResizeObserver(updatePosition)
    if (nodeRef.current) {
      resizeObserver.observe(nodeRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [node.id, onPositionUpdate, containerRef])

  const handleAddChildren = () => {
    updateNode({
      ...node,
      yes: {
        id: getNewId(),
        text: { value: 'Yes', isEditing: false },
        yes: null,
        no: null,
      },
      no: {
        id: getNewId(),
        text: { value: 'No', isEditing: false },
        yes: null,
        no: null,
      },
    })
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
    <div className="relative" style={{ width: `${width}px` }}>
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
            disabled={node.yes !== null && node.no !== null}
            className={node.id === 0 ? 'invisible' : ''}
          >
            <Plus />
          </Button>
        </div>
      </Card>

      {node.no && (
        <div
          className="left-0 absolute"
          style={{ top: `${verticalSpacing}px`, width: `${width / 2}px` }}
        >
          <TreeNode
            node={node.no}
            updateNode={(newNoNode) => updateNode({ ...node, no: newNoNode })}
            deleteNode={deleteNode}
            depth={depth + 1}
            xOffset={xOffset - width / 4}
            onPositionUpdate={onPositionUpdate}
            getNewId={getNewId}
            containerRef={containerRef}
          />
        </div>
      )}

      {node.yes && (
        <div
          className="right-0 absolute"
          style={{ top: `${verticalSpacing}px`, width: `${width / 2}px` }}
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
            getNewId={getNewId}
            containerRef={containerRef}
          />
        </div>
      )}
    </div>
  )
}

export default TreeNode
