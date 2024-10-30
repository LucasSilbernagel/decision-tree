import { useNavigate } from '@remix-run/react'
import { Button } from '../ui/button'
import { NEW_TREE, SERIALIZED_EXAMPLE_TREE, TREE_CONSTANTS } from '~/constants'
import { DecisionTree } from '~/types'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { serializeDecisionTree } from '~/utils'
import { Plus, Eye } from 'lucide-react'

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

    setDecisionTree(NEW_TREE)
    setTreeWidth(initialWidth)
    setTreeHeight(initialHeight)

    // Immediately update URL with the new tree data
    const serializedTree = serializeDecisionTree(NEW_TREE)
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
          <Eye className="mr-1.5 w-4 h-4" /> Example
        </Button>
        <Button onClick={createNewDecisionTree}>
          <Plus className="mr-1.5 w-4 h-4" /> New
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
