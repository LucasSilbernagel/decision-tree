import type { MetaFunction } from '@remix-run/node'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
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
}

export default function Index() {
  const [decisionTree, setDecisionTree] = useState<{
    title: { value: string; isEditing: boolean }
    node: DecisionTreeNode
  } | null>(null)

  const [treeWidth, setTreeWidth] = useState(0)
  const treeContainerRef = useRef<HTMLDivElement>(null)

  const [decisionTreeTitleDraft, setDecisionTreeTitleDraft] = useState(
    decisionTree?.title.value || ''
  )

  const [highestId, setHighestId] = useState(0)

  const startNewDecisionTree = () => {
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
  }

  const updateTree = (newNode: DecisionTreeNode) => {
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

  const deleteNode = (
    nodeToDelete: DecisionTreeNode,
    currentNode: DecisionTreeNode | null
  ): DecisionTreeNode | null => {
    if (!currentNode) return null
    if (currentNode.id === nodeToDelete.id) return null

    return {
      ...currentNode,
      yes: deleteNode(nodeToDelete, currentNode.yes),
      no: deleteNode(nodeToDelete, currentNode.no),
    }
  }

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

    const width = Math.max(300, leftDimensions.width + rightDimensions.width)
    const height = Math.max(leftDimensions.height, rightDimensions.height) + 100

    return { width, height }
  }

  const renderNode = (
    node: DecisionTreeNode,
    updateNode: (newNode: DecisionTreeNode) => void,
    depth: number = 0,
    xOffset: number = 0
  ) => {
    const { width } = calculateTreeDimensions(node)
    const verticalSpacing = 100
    const leftWidth = node.no ? calculateTreeDimensions(node.no).width : 0
    const rightWidth = node.yes ? calculateTreeDimensions(node.yes).width : 0
    const leftXOffset = xOffset - width / 2 + leftWidth / 2
    const rightXOffset = xOffset + width / 2 - rightWidth / 2

    return (
      <div className="relative" style={{ width: `${width}px` }}>
        {/* Main node */}
        <Card
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
              placeholder="Yes or no?"
              onChange={(e) =>
                updateNode({
                  ...node,
                  text: { value: e.target.value, isEditing: false },
                })
              }
            />
          </div>
          {node.id >= 1 && (
            <div className="flex justify-between p-2 w-full">
              <div>
                <Button
                  className={node.id < 3 ? 'hidden' : ''}
                  size="icon"
                  onClick={() => {
                    if (decisionTree) {
                      const updatedNode = deleteNode(node, decisionTree.node)
                      if (updatedNode) {
                        setDecisionTree({
                          ...decisionTree,
                          node: updatedNode,
                        })
                      }
                    }
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
              <div>
                <Button
                  disabled={node.yes !== null && node.no !== null}
                  size="icon"
                  onClick={() =>
                    updateNode({
                      ...node,
                      no: {
                        id: highestId + 1,
                        text: { value: 'No', isEditing: false },
                        yes: null,
                        no: null,
                      },
                      yes: {
                        id: highestId + 2,
                        text: { value: 'Yes', isEditing: false },
                        yes: null,
                        no: null,
                      },
                    })
                  }
                >
                  <Plus />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Yes and No branches */}
        <div
          className="right-0 left-0 absolute"
          style={{ top: `${(depth + 1) * verticalSpacing}px` }}
        >
          {/* No branch (Left) */}
          {node.no && (
            <div
              className="-left-3 absolute"
              style={{ width: `${leftWidth}px` }}
            >
              {renderNode(
                node.no,
                (newNoNode) => {
                  updateNode({
                    ...node,
                    no: newNoNode,
                  })
                },
                depth + 1,
                leftXOffset
              )}
            </div>
          )}

          {/* Yes branch (Right) */}
          {node.yes && (
            <div
              className="-right-3 absolute"
              style={{ width: `${rightWidth}px` }}
            >
              {renderNode(
                node.yes,
                (newYesNode) => {
                  updateNode({
                    ...node,
                    yes: newYesNode,
                  })
                },
                depth + 1,
                rightXOffset
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    const getHighestId = (node: DecisionTreeNode | null): number => {
      if (node === null) {
        return -1 // Return a default value for null branches
      }
      const yesId = node.yes ? getHighestId(node.yes) : -1
      const noId = node.no ? getHighestId(node.no) : -1
      return Math.max(node.id, yesId, noId)
    }

    if (decisionTree) {
      setHighestId(getHighestId(decisionTree.node))
      setDecisionTreeTitleDraft(decisionTree.title.value)
      const { width } = calculateTreeDimensions(decisionTree.node)
      setTreeWidth(width)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                className="relative w-full overflow-x-auto"
                style={{ minHeight: '500px' }}
              >
                <div
                  ref={treeContainerRef}
                  className="inline-block min-w-full transition-all duration-300 ease-in-out"
                >
                  {renderNode(decisionTree.node, updateTree)}
                </div>
              </div>
            </>
          ) : (
            <Button onClick={startNewDecisionTree}>
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
