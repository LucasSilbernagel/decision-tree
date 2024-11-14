import { useNavigate } from '@remix-run/react'
import { Button } from '../ui/button'
import { NEW_TREE, SERIALIZED_EXAMPLE_TREE } from '~/constants'
import { DecisionTree } from '~/types'
import { MutableRefObject } from 'react'
import { serializeDecisionTree } from '~/utils'
import { Plus, Eye } from 'lucide-react'

type EmptyTreeProps = {
  setDecisionTree: (tree: DecisionTree | null) => void
  lastSerializedState: MutableRefObject<string>
}

const EmptyTree = ({
  setDecisionTree,
  lastSerializedState,
}: EmptyTreeProps) => {
  const navigate = useNavigate()

  const createNewDecisionTree = () => {
    setDecisionTree(NEW_TREE)

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
      <div className="mx-auto my-12 px-4 md:px-0 max-w-screen-md">
        <div className="flex justify-center mb-12 w-full">
          <div className="max-w-[200px]">
            <img src="/tree.webp" alt="" />
          </div>
        </div>
        <h2 className="text-xl">
          Decision Tree is simple generator of shareable and accessible decision
          trees. Decision tree data is serialized and saved in the URL, making
          it easy to share and save created decision trees.
        </h2>
      </div>
    </div>
  )
}

export default EmptyTree
