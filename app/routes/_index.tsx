import type { MetaFunction } from '@remix-run/node'
import { useState } from 'react'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export type DecisionTreeNode = {
  id: number
  decision: string | null
  condition: string
  yes: DecisionTreeNode | null
  no: DecisionTreeNode | null
}

export default function Index() {
  const [decisionTree, setDecisionTree] = useState<{
    title: string
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
      title: 'Decision Tree Title',
      node: {
        id: 0,
        decision: null,
        condition: 'Yes or no?',
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
      <div className="ml-4 mt-4">
        <div className="mt-2">
          <strong>Decision:</strong>
          <input
            type="text"
            value={node.decision || ''}
            placeholder="Enter decision"
            onChange={(e) =>
              updateNode({
                ...node,
                decision: e.target.value,
              })
            }
          />
        </div>

        <div className="mt-2">
          <strong>Condition:</strong>
          <input
            type="text"
            value={node.condition}
            placeholder="Enter condition"
            onChange={(e) =>
              updateNode({
                ...node,
                condition: e.target.value,
              })
            }
          />
        </div>

        {/* Render the yes branch or provide a way to create it */}
        <div className="mt-2">
          <strong>Yes: </strong>
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
                    decision: null,
                    condition: 'Yes or no?',
                    yes: null,
                    no: null,
                  },
                })
              }
              className="text-blue-600"
            >
              Add Yes Branch
            </button>
          )}
        </div>

        {/* Render the no branch or provide a way to create it */}
        <div className="mt-2">
          <strong>No: </strong>
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
                    decision: null,
                    condition: 'Yes or no?',
                    yes: null,
                    no: null,
                  },
                })
              }
              className="text-red-600"
            >
              Add No Branch
            </button>
          )}
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
              <h2>{decisionTree.title}</h2>
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
