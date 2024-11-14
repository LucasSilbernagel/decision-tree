/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import EmptyTree from './EmptyTree'
import { NEW_TREE, SERIALIZED_EXAMPLE_TREE } from '~/constants'

const mockNavigate = vi.fn()

vi.mock('@remix-run/react', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('~/utils', () => ({
  serializeDecisionTree: () => 'mock-serialized-tree',
}))

describe('EmptyTree', () => {
  const mockSetDecisionTree = vi.fn()
  const mockLastSerializedState = { current: '' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with all basic elements', () => {
    render(
      <EmptyTree
        setDecisionTree={mockSetDecisionTree}
        lastSerializedState={mockLastSerializedState}
      />
    )

    expect(screen.getByRole('button', { name: /example/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Decision Tree is simple generator of shareable and accessible decision trees. Decision tree data is serialized and saved in the URL, making it easy to share and save created decision trees.'
    )
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      '/tree.webp'
    )
  })

  it('navigates to example tree when Example button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EmptyTree
        setDecisionTree={mockSetDecisionTree}
        lastSerializedState={mockLastSerializedState}
      />
    )

    await user.click(screen.getByRole('button', { name: /example/i }))

    expect(mockNavigate).toHaveBeenCalledWith(
      `?tree=${SERIALIZED_EXAMPLE_TREE}`,
      { replace: true }
    )
  })

  it('creates new tree when New button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EmptyTree
        setDecisionTree={mockSetDecisionTree}
        lastSerializedState={mockLastSerializedState}
      />
    )

    await user.click(screen.getByRole('button', { name: /new/i }))

    expect(mockSetDecisionTree).toHaveBeenCalledWith(NEW_TREE)

    expect(mockLastSerializedState.current).toBe('mock-serialized-tree')
    expect(mockNavigate).toHaveBeenCalledWith('?tree=mock-serialized-tree', {
      replace: true,
    })
  })

  it('has correct layout classes', () => {
    const { container } = render(
      <EmptyTree
        setDecisionTree={mockSetDecisionTree}
        lastSerializedState={mockLastSerializedState}
      />
    )

    expect(container.firstChild).toHaveClass('min-h-[550px]')
    expect(container.querySelector('.flex.sm\\:flex-row')).toBeInTheDocument()
    expect(container.querySelector('.flex.justify-center')).toBeInTheDocument()
  })

  it('renders image with empty alt text for decorative purposes', () => {
    render(
      <EmptyTree
        setDecisionTree={mockSetDecisionTree}
        lastSerializedState={mockLastSerializedState}
      />
    )

    const image = screen.getByRole('presentation')
    expect(image).toHaveAttribute('alt', '')
  })
})
