import type { MetaFunction } from '@remix-run/node'
import { Pencil, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
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

  const [decisionTreeTitleDraft, setDecisionTreeTitleDraft] = useState(
    decisionTree?.title.value || ''
  )

  const getHighestId = (node: DecisionTreeNode | null): number => {
    if (node === null) {
      return -1 // Return a default value for null branches
    }
    const yesId = node.yes ? getHighestId(node.yes) : -1
    const noId = node.no ? getHighestId(node.no) : -1
    return Math.max(node.id, yesId, noId)
  }

  const startNewDecisionTree = () => {
    setDecisionTree({
      title: { value: 'Decision Tree Title', isEditing: false },
      node: {
        id: 0,
        text: { value: 'Yes or no?', isEditing: false },
        yes: null,
        no: null,
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

  const renderNode = (
    node: DecisionTreeNode,
    updateNode: (newNode: DecisionTreeNode) => void
  ) => {
    return (
      <div className="relative flex flex-col items-center mb-12">
        {/* Main node */}
        <Card className="flex flex-col items-center border-gray-300 bg-gray-50 shadow-sm border rounded-lg w-[300px]">
          <div>
            <Label htmlFor={`condition-${node.id}`} className="sr-only">
              Condition {node.id}
            </Label>
            <Input
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
        </Card>

        {/* Yes and No branches */}
        <div className="relative flex justify-center mt-8 w-full">
          {/* No branch (Left) */}
          <div className="flex flex-col items-center mx-8 w-[300px]">
            <strong className="mb-2 text-red-600">No:</strong>
            <div className="flex-grow w-[300px]">
              {node.no ? (
                renderNode(node.no, (newNoNode) => {
                  updateNode({
                    ...node,
                    no: newNoNode,
                  })
                })
              ) : (
                <button
                  onClick={() =>
                    updateNode({
                      ...node,
                      no: {
                        id: getHighestId(node) + 1,
                        text: { value: 'Yes or no?', isEditing: false },
                        yes: null,
                        no: null,
                      },
                    })
                  }
                  className="mt-2 text-red-500 hover:text-red-700 hover:underline"
                >
                  Add No Branch
                </button>
              )}
            </div>
          </div>

          {/* Yes branch (Right) */}
          <div className="flex flex-col items-center mx-8 w-[300px]">
            <strong className="mb-2 text-green-600">Yes:</strong>
            <div className="flex-grow w-[300px]">
              {node.yes ? (
                renderNode(node.yes, (newYesNode) => {
                  updateNode({
                    ...node,
                    yes: newYesNode,
                  })
                })
              ) : (
                <button
                  onClick={() =>
                    updateNode({
                      ...node,
                      yes: {
                        id: getHighestId(node) + 1,
                        text: { value: 'Yes or no?', isEditing: false },
                        yes: null,
                        no: null,
                      },
                    })
                  }
                  className="mt-2 text-green-500 hover:text-green-700 hover:underline"
                >
                  Add Yes Branch
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (decisionTree) {
      setDecisionTreeTitleDraft(decisionTree.title.value)
    }
  }, [decisionTree])

  return (
    <div className="mx-auto pt-12 text-center">
      <header>
        <h1 className="sr-only">Decision Tree</h1>
      </header>
      <main>
        <div>
          {decisionTree ? (
            <>
              <div className="flex items-center gap-4 mx-auto mb-6 max-w-max">
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
                      />
                    </>
                  ) : (
                    <h2 className="text-2xl">{decisionTree.title.value}</h2>
                  )}
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleTitleEdit}
                  >
                    {decisionTree.title.isEditing ? <Save /> : <Pencil />}
                  </Button>
                </div>
              </div>

              {renderNode(decisionTree.node, updateTree)}
            </>
          ) : (
            <Button onClick={startNewDecisionTree}>
              Create new decision tree
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
