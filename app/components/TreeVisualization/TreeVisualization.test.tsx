import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { TreeVisualization, TreeVisualizationProps } from './TreeVisualization'
import { DecisionTreeNode } from '~/types'
import { TreeNodeProps } from '../TreeNode/TreeNode'

const mockVisibilityState = {
  callback: undefined as ((isVisible: boolean) => void) | undefined,
}

vi.mock('~/components/TreeNode/TreeNode', () => ({
  default: (props: TreeNodeProps) => {
    // Store the callback in our mock state
    mockVisibilityState.callback = props.onRootVisibilityChange
    return (
      <div data-testid="mock-tree-node">
        {props.node.text.value}
        <button
          data-testid="update-node-button"
          onClick={() =>
            props.updateNode({
              ...props.node,
              text: { value: 'Updated', isEditing: false },
            })
          }
        >
          Update Node
        </button>
        <button
          data-testid="delete-node-button"
          onClick={() => props.deleteNode(props.node.id)}
        >
          Delete Node
        </button>
      </div>
    )
  },
}))

describe('TreeVisualization', () => {
  const createMockContainer = () => {
    const mockScrollTo = vi.fn()
    const mockDiv = document.createElement('div')

    // Create a proxy to ensure the scrollTo mock is always accessible
    const divProxy = new Proxy(mockDiv, {
      get(target, prop) {
        if (prop === 'scrollTo') {
          return mockScrollTo
        }
        return Reflect.get(target, prop)
      },
    })

    Object.defineProperties(divProxy, {
      clientWidth: { value: 1000, configurable: true, writable: true },
      style: { value: {}, writable: true },
      offsetLeft: { value: 0, configurable: true, writable: true },
      offsetTop: { value: 0, configurable: true, writable: true },
      scrollLeft: { value: 0, configurable: true, writable: true },
      scrollTop: { value: 0, configurable: true, writable: true },
    })

    return { mockDiv: divProxy, mockScrollTo }
  }

  // Test data setup
  const mockNode: DecisionTreeNode = {
    id: 0,
    text: { value: 'Root Node', isEditing: false },
    yes: {
      id: 1,
      text: { value: 'Yes Node', isEditing: false },
      yes: null,
      no: null,
      parentId: 0,
    },
    no: {
      id: 2,
      text: { value: 'No Node', isEditing: false },
      yes: null,
      no: null,
      parentId: 0,
    },
  }

  const setupComponent = () => {
    const { mockDiv, mockScrollTo } = createMockContainer()
    const containerRef = { current: mockDiv }

    const props: TreeVisualizationProps = {
      node: mockNode,
      treeHeight: 500,
      treeWidth: 800,
      nodePositions: new Map([
        [0, { x: 400, y: 0, type: 'root' as const }],
        [1, { x: 600, y: 200, type: 'yes' as const }],
        [2, { x: 200, y: 200, type: 'no' as const }],
      ]),
      updateTree: vi.fn(),
      deleteNode: vi.fn(),
      onPositionUpdate: vi.fn(),
      getNewIds: vi.fn(() => ({ noId: 3, yesId: 4 })),
      containerRef,
    }

    return { props, mockScrollTo }
  }

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('renders the tree visualization with correct structure', () => {
    const { props } = setupComponent()
    render(<TreeVisualization {...props} />)

    expect(screen.getByRole('application')).toBeInTheDocument()
    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.getByTestId('mock-tree-node')).toBeInTheDocument()
    expect(screen.queryByTestId('back-to-start')).not.toBeInTheDocument()
  })

  it('renders SVG connection lines between nodes', () => {
    const { props } = setupComponent()
    render(<TreeVisualization {...props} />)

    const container = screen.getByRole('region')
    // eslint-disable-next-line testing-library/no-node-access
    const lines = container.querySelectorAll('line')

    // We expect 2 lines - one for "yes" and one for "no" connection
    expect(lines).toHaveLength(2)

    // Verify the yes line (green)
    const yesLine = Array.from(lines).find(
      (line) => line.getAttribute('stroke') === 'green'
    )
    expect(yesLine).toBeInTheDocument()

    // Verify the no line (red)
    const noLine = Array.from(lines).find(
      (line) => line.getAttribute('stroke') === 'red'
    )
    expect(noLine).toBeInTheDocument()
  })

  it('handles node updates correctly', async () => {
    const { props } = setupComponent()
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    render(<TreeVisualization {...props} />)

    await user.click(screen.getByTestId('update-node-button'))
    vi.runAllTimers()

    expect(props.updateTree).toHaveBeenCalledWith({
      ...mockNode,
      text: { value: 'Updated', isEditing: false },
    })
  })

  it('handles node deletion correctly', async () => {
    const { props } = setupComponent()
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })

    render(<TreeVisualization {...props} />)

    await user.click(screen.getByTestId('delete-node-button'))
    vi.runAllTimers()

    expect(props.deleteNode).toHaveBeenCalledWith(mockNode.id)
  })

  describe('Drag Navigation', () => {
    it('updates cursor and handles mouse events during drag', async () => {
      const { props } = setupComponent()
      render(<TreeVisualization {...props} />)
      const container = screen.getByRole('region')

      // Initial state
      expect(container).toHaveStyle({ cursor: 'grab' })

      // Start drag
      fireEvent.mouseDown(container, {
        pageX: 100,
        pageY: 100,
        target: container,
      })
      expect(container).toHaveStyle({ cursor: 'grabbing' })

      // Move while dragging
      fireEvent.mouseMove(container, { pageX: 200, pageY: 200 })

      // End drag
      fireEvent.mouseUp(container)
      expect(container).toHaveStyle({ cursor: 'grab' })
    })

    it('cancels drag operation when mouse leaves container', () => {
      const { props } = setupComponent()
      render(<TreeVisualization {...props} />)
      const container = screen.getByRole('region')

      fireEvent.mouseDown(container, {
        pageX: 100,
        pageY: 100,
        target: container,
      })
      fireEvent.mouseLeave(container)

      expect(container).toHaveStyle({ cursor: 'grab' })
    })
  })
})
