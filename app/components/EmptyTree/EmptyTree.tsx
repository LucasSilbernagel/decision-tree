import { useNavigate } from '@remix-run/react'
import { Button } from '../ui/button'
import { SERIALIZED_EXAMPLE_TREE, TREE_CONSTANTS } from '~/constants'
import { DecisionTree } from '~/types'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { serializeDecisionTree } from '~/utils'

type EmptyTreeProps = {
  setDecisionTree: (tree: DecisionTree | null) => void
  setTreeWidth: Dispatch<SetStateAction<number>>
  setTreeHeight: Dispatch<SetStateAction<number>>
  lastSerializedState: MutableRefObject<string>
}

const EmptyTree = ({
  setDecisionTree,
  setTreeWidth,
  setTreeHeight,
  lastSerializedState,
}: EmptyTreeProps) => {
  const navigate = useNavigate()

  const createNewDecisionTree = () => {
    const initialWidth = TREE_CONSTANTS.MIN_NODE_WIDTH * 3
    const initialHeight = TREE_CONSTANTS.VERTICAL_SPACING * 2

    const newTree = {
      title: { value: 'Decision Tree Title', isEditing: false },
      node: {
        id: 0,
        text: { value: 'Yes or no?', isEditing: false },
        yes: {
          id: 1,
          text: { value: 'Yes', isEditing: false },
          yes: null,
          no: null,
          parentId: 0,
        },
        no: {
          id: 2,
          text: { value: 'No', isEditing: false },
          yes: null,
          no: null,
          parentId: 0,
        },
      },
    }

    setDecisionTree(newTree)
    setTreeWidth(initialWidth)
    setTreeHeight(initialHeight)

    // Immediately update URL with the new tree
    const serializedTree = serializeDecisionTree(newTree)
    lastSerializedState.current = serializedTree
    navigate(`?tree=${serializedTree}`, { replace: true })
  }

  return (
    <div className="min-h-[550px]">
      <div className="flex sm:flex-row flex-col justify-center gap-4 mb-6 px-4 sm:px-0">
        <Button
          onClick={() =>
            navigate(`?tree=${SERIALIZED_EXAMPLE_TREE}`, { replace: true })
          }
        >
          View an example decision tree
        </Button>
        <Button onClick={createNewDecisionTree}>
          Create a new decision tree
        </Button>
      </div>
      <div className="my-12">
        <div className="flex justify-center mb-12 w-full">
          <div className="max-w-[200px]">
            <img src="/tree.webp" alt="" />
          </div>
        </div>
        <p className="text-xl">
          A simple generator of shareable decision trees.
        </p>
      </div>
    </div>
  )
}

export default EmptyTree
