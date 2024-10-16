import type { MetaFunction } from '@remix-run/node'
import { useState } from 'react'
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
      title: { value: 'Decision Tree', isEditing: false },
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

  const renderNode = (
    node: DecisionTreeNode,
    updateNode: (newNode: DecisionTreeNode) => void
  ) => {
    return (
      <div className="relative flex flex-col items-center mb-12">
        {/* Main node */}
        <Card className="flex flex-col items-center border border-gray-300 rounded-lg bg-gray-50 shadow-sm w-[300px]">
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
        <div className="relative flex justify-center w-full mt-8">
          {/* No branch (Left) */}
          <div className="flex flex-col items-center w-[300px] mx-8">
            <strong className="text-red-600 mb-2">No:</strong>
            <div className="w-[300px] flex-grow">
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
          <div className="flex flex-col items-center w-[300px] mx-8">
            <strong className="text-green-600 mb-2">Yes:</strong>
            <div className="w-[300px] flex-grow">
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

  return (
    <div className="text-center mx-auto pt-12">
      <header>
        <h1 className="sr-only">Decision Tree</h1>
      </header>
      <main>
        <div>
          {decisionTree ? (
            <>
              <h2 className="mb-6">{decisionTree.title.value}</h2>
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
