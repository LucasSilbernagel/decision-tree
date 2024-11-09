import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TreeNodeTitle } from './TreeNodeTitle'

describe('TreeNodeTitle', () => {
  const defaultProps = {
    id: 0,
    value: 'Test Question',
    isEditing: false,
    onChange: vi.fn(),
    onEditToggle: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('View Mode', () => {
    it('renders button with text in view mode', () => {
      render(<TreeNodeTitle {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'edit text' })
      expect(button).toBeVisible()
      expect(screen.getByText('Test Question')).toBeVisible()
    })

    it('shows placeholder text when value is empty', () => {
      render(<TreeNodeTitle {...defaultProps} value="" />)

      expect(screen.getByText('Yes or no?')).toBeVisible()
    })

    it('calls onEditToggle when button is clicked', async () => {
      const user = userEvent.setup()
      render(<TreeNodeTitle {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: 'edit text' }))
      expect(defaultProps.onEditToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edit Mode', () => {
    const editModeProps = {
      ...defaultProps,
      isEditing: true,
    }

    it('renders textarea in edit mode', () => {
      render(<TreeNodeTitle {...editModeProps} />)

      const textarea = screen.getByRole('textbox', { name: 'Condition 1' })
      expect(textarea).toBeVisible()
      expect(textarea).toHaveValue('Test Question')
    })

    it('calls onChange when text is entered', async () => {
      const user = userEvent.setup()
      render(<TreeNodeTitle {...editModeProps} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'New text')

      expect(defaultProps.onChange).toHaveBeenCalled()
    })

    it('handles Shift+Enter without saving', async () => {
      const user = userEvent.setup()
      render(<TreeNodeTitle {...editModeProps} />)

      await user.keyboard('{Shift>}{Enter}{/Shift}')

      expect(defaultProps.onEditToggle).not.toHaveBeenCalled()
    })

    it('calls onEditToggle when textarea loses focus', async () => {
      const user = userEvent.setup()
      render(<TreeNodeTitle {...editModeProps} />)

      await user.tab() // Move focus away from textarea

      expect(defaultProps.onEditToggle).toHaveBeenCalledTimes(1)
    })

    it('handles Enter key press to save', async () => {
      const user = userEvent.setup()
      render(<TreeNodeTitle {...editModeProps} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '{Enter}')

      expect(defaultProps.onEditToggle).toHaveBeenCalledTimes(1)
    })

    it('allows new line with Shift+Enter', async () => {
      const user = userEvent.setup()
      render(<TreeNodeTitle {...editModeProps} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '{Shift>}{Enter}{/Shift}')

      expect(defaultProps.onEditToggle).not.toHaveBeenCalled()
    })

    it('has correct accessibility attributes', () => {
      render(<TreeNodeTitle {...editModeProps} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('id', 'condition-0')
      expect(screen.getByLabelText('Condition 1')).toBeVisible()
    })
  })
})
