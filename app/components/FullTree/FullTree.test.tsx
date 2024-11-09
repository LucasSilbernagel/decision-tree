import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import FullTree from './FullTree'
import { EXAMPLE_TREE } from '~/constants'

const mockToast = vi.fn()

vi.mock('~/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

vi.mock('@remix-run/react', () => ({
  useNavigate: () => vi.fn(),
}))

describe('FullTree', () => {
  const mockProps = {
    decisionTree: EXAMPLE_TREE,
    setDecisionTree: vi.fn(),
    treeTitle: EXAMPLE_TREE.title.value,
    setTreeTitle: vi.fn(),
    treeHeight: 500,
    treeWidth: 800,
    nodePositions: new Map(),
    setNodePositions: vi.fn(),
    highestNodeId: 12,
    setHighestNodeId: vi.fn(),
    treeContainerRef: { current: document.createElement('div') },
  }

  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
      configurable: true,
    })

    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost:3000' },
      configurable: true,
    })
  })

  it('renders share and delete buttons', () => {
    render(<FullTree {...mockProps} />)

    expect(screen.getByText('Share Tree')).toBeInTheDocument()
    expect(screen.getByText('Start Over')).toBeInTheDocument()
  })

  it('handles share button click successfully', async () => {
    const user = userEvent.setup()

    navigator.clipboard.writeText = vi
      .fn()
      .mockImplementation(() => Promise.resolve())

    render(<FullTree {...mockProps} />)

    await user.click(screen.getByText('Share Tree'))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'http://localhost:3000'
    )
    expect(mockToast).toHaveBeenCalledWith({
      title: 'URL copied to clipboard!',
    })
  })

  it('handles share button click failure', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const user = userEvent.setup()

    navigator.clipboard.writeText = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error('Failed to copy')))

    render(<FullTree {...mockProps} />)

    await user.click(screen.getByText('Share Tree'))

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Failed to copy URL',
      variant: 'destructive',
    })

    consoleErrorSpy.mockRestore()
  })

  it('handles title edit', async () => {
    const user = userEvent.setup()
    render(<FullTree {...mockProps} />)

    await user.click(screen.getByText(mockProps.decisionTree.title.value))

    expect(mockProps.setDecisionTree).toHaveBeenCalledWith({
      ...mockProps.decisionTree,
      title: {
        value: mockProps.decisionTree.title.value,
        isEditing: true,
      },
    })
  })

  it('updates node positions', () => {
    render(<FullTree {...mockProps} />)

    const newPosition = { x: 100, y: 100 }
    mockProps.setNodePositions(new Map().set(1, newPosition))

    expect(mockProps.setNodePositions).toHaveBeenCalled()
  })
})
