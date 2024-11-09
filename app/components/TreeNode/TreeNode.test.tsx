import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import TreeNode from './TreeNode'
import { DecisionTreeNode } from '~/types'
import DOMPurify from 'dompurify'

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input),
  },
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('TreeNode', () => {
  const mockNode: DecisionTreeNode = {
    id: 0,
    text: { value: 'Test Question', isEditing: false },
    yes: null,
    no: null,
  }

  const mockChildNode: DecisionTreeNode = {
    id: 0,
    text: { value: 'Test Question', isEditing: false },
    yes: {
      id: 1,
      text: { value: 'Yes Answer', isEditing: false },
      yes: null,
      no: null,
      parentId: 0,
    },
    no: {
      id: 2,
      text: { value: 'No Answer', isEditing: false },
      yes: null,
      no: null,
      parentId: 0,
    },
  }

  const defaultProps = {
    node: mockNode,
    updateNode: vi.fn(),
    deleteNode: vi.fn(),
    depth: 0,
    xOffset: 0,
    onPositionUpdate: vi.fn(),
    getNewIds: vi.fn(() => ({ noId: 1, yesId: 2 })),
    containerRef: { current: document.createElement('div') },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles text editing', async () => {
    const user = userEvent.setup()
    render(<TreeNode {...defaultProps} />)

    expect(screen.getByText('Test Question')).toBeVisible()

    await user.click(screen.getByLabelText('edit text'))

    expect(defaultProps.updateNode).toHaveBeenCalledWith({
      ...mockNode,
      text: { value: 'Test Question', isEditing: true },
    })
  })

  it('handles deleting nodes', async () => {
    const user = userEvent.setup()
    render(
      <TreeNode {...defaultProps} node={{ ...mockNode, id: 3 }} depth={1} />
    )

    await user.click(screen.getByLabelText('Delete node'))

    expect(defaultProps.deleteNode).toHaveBeenCalledWith(3)
  })

  it('renders child nodes when present', () => {
    render(<TreeNode {...defaultProps} node={mockChildNode} />)

    expect(screen.getByText('Yes Answer')).toBeVisible()
    expect(screen.getByText('No Answer')).toBeVisible()
  })

  it('disables delete button for root node', () => {
    render(<TreeNode {...defaultProps} depth={0} />)

    const deleteButton = screen.getByLabelText('Delete node')
    expect(deleteButton).toBeDisabled()
  })

  it('adds child nodes when clicking the add button', async () => {
    const user = userEvent.setup()
    render(
      <TreeNode {...defaultProps} node={{ ...mockNode, id: 3 }} depth={1} />
    )

    const addButton = screen.getByLabelText('Add child nodes')
    await user.click(addButton)

    expect(defaultProps.updateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        yes: expect.objectContaining({
          id: 2,
          text: { value: 'Yes', isEditing: false },
          yes: null,
          no: null,
          parentId: 3,
        }),
        no: expect.objectContaining({
          id: 1,
          text: { value: 'No', isEditing: false },
          yes: null,
          no: null,
          parentId: 3,
        }),
      })
    )
  })

  it('handles keyboard interaction for adding children', async () => {
    const user = userEvent.setup()
    render(
      <TreeNode {...defaultProps} node={{ ...mockNode, id: 3 }} depth={1} />
    )

    const addButton = screen.getByLabelText('Add child nodes')

    addButton.focus()
    await user.keyboard('{Enter}')

    expect(defaultProps.updateNode).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        yes: expect.objectContaining({
          id: 2,
          text: { value: 'Yes', isEditing: false },
          yes: null,
          no: null,
          parentId: 3,
        }),
        no: expect.objectContaining({
          id: 1,
          text: { value: 'No', isEditing: false },
          yes: null,
          no: null,
          parentId: 3,
        }),
      })
    )
  })

  it('handles keyboard interaction for editing text', async () => {
    const user = userEvent.setup()
    render(<TreeNode {...defaultProps} />)

    await user.tab() // Focus the button
    await user.keyboard('{Enter}')

    expect(defaultProps.updateNode).toHaveBeenCalledWith({
      ...mockNode,
      text: { value: 'Test Question', isEditing: true },
    })
  })

  it('calls onRootVisibilityChange for root node', () => {
    const onRootVisibilityChange = vi.fn()
    render(
      <TreeNode
        {...defaultProps}
        onRootVisibilityChange={onRootVisibilityChange}
      />
    )

    expect(IntersectionObserver).toHaveBeenCalled()
  })

  it('updates node position on resize', () => {
    render(<TreeNode {...defaultProps} />)

    expect(ResizeObserver).toHaveBeenCalled()
    expect(defaultProps.onPositionUpdate).toHaveBeenCalled()
  })

  it('sanitizes input text', async () => {
    const user = userEvent.setup()
    render(
      <TreeNode
        {...defaultProps}
        node={{ ...mockNode, text: { value: 'Test', isEditing: true } }}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'New Text')

    expect(DOMPurify.sanitize).toHaveBeenCalled()
  })
})
