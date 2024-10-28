import { useEffect, useRef } from 'react'
import { DecisionTreeNode, NodePosition } from '~/types'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { TREE_CONSTANTS } from '~/constants'
import { TreeNodeTitle } from '../TreeNodeTitle/TreeNodeTitle'
import { calculateTreeDimensions } from '~/lib/utils'
import DOMPurify from 'dompurify'

const TreeNode = ({
  node,
  updateNode,
  deleteNode,
  depth,
  xOffset,
  onPositionUpdate,
  getNewIds,
  containerRef,
  onRootVisibilityChange,
}: {
  node: DecisionTreeNode
  updateNode: (newNode: DecisionTreeNode) => void
  deleteNode: (nodeId: number) => void
  depth: number
  xOffset: number
  onPositionUpdate: (id: number, position: NodePosition) => void
  getNewIds: () => { noId: number; yesId: number }
  containerRef: React.RefObject<HTMLDivElement>
  onRootVisibilityChange?: (isVisible: boolean) => void
}) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRef<NodePosition | null>(null)
  const { VERTICAL_SPACING, MAX_DEPTH } = TREE_CONSTANTS

  // Calculate dimensions for current subtree
  const { width } = calculateTreeDimensions(node, depth)

  // Calculate child widths
  const noWidth = node.no
    ? calculateTreeDimensions(node.no, depth + 1).width
    : 0
  const yesWidth = node.yes
    ? calculateTreeDimensions(node.yes, depth + 1).width
    : 0

  const maxNodesReached = depth >= MAX_DEPTH

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

  useEffect(() => {
    const currentNode = nodeRef.current

    if (node.id === 0 && currentNode && onRootVisibilityChange) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            onRootVisibilityChange(entry.isIntersecting)
          })
        },
        {
          root: containerRef.current,
          threshold: 0.1,
        }
      )

      observer.observe(currentNode)

      return () => {
        observer.disconnect()
      }
    }
  }, [containerRef, node.id, onRootVisibilityChange])

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode({
      ...node,
      text: { ...node.text, value: DOMPurify.sanitize(e.target.value) },
    })
  }

  const handleEditToggle = () => {
    updateNode({
      ...node,
      text: { ...node.text, isEditing: !node.text.isEditing },
    })
  }

  return (
    <div
      className="relative"
      style={{
        width: `${width}px`,
        minHeight: `${VERTICAL_SPACING}px`,
      }}
    >
      <Card
        ref={nodeRef}
        className="left-1/2 z-10 absolute flex flex-col items-center border-gray-300 bg-gray-50 shadow-sm p-0 border rounded-lg w-[300px] transform -translate-x-1/2 overflow-hidden"
        style={{ top: `${depth * VERTICAL_SPACING}px` }}
      >
        <TreeNodeTitle
          id={node.id}
          value={DOMPurify.sanitize(node.text.value)}
          isEditing={node.text.isEditing}
          onChange={handleTextChange}
          onEditToggle={handleEditToggle}
        />
        <div className="flex justify-between p-2 border-t w-full">
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
            top: `${VERTICAL_SPACING}px`,
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
            top: `${VERTICAL_SPACING}px`,
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
