import { useEffect, useRef } from 'react'
import { DecisionTreeNode } from '~/routes/_index'
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
}: {
  node: DecisionTreeNode
  updateNode: (newNode: DecisionTreeNode) => void
  deleteNode: (nodeId: number) => void
  depth: number
  xOffset: number
  onPositionUpdate: (id: number, position: NodePosition) => void
  getNewId: () => number
}) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const verticalSpacing = 100
  const minNodeWidth = 300

  const calculateTreeDimensions = (
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

  const { width } = calculateTreeDimensions(node)

  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect()
      onPositionUpdate(node.id, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    }
  }, [node.id, xOffset, depth, onPositionUpdate, width])

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
          />
        </div>
      )}
    </div>
  )
}

export default TreeNode
