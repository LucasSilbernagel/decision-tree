import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TreeTitle } from './TreeTitle'
import DOMPurify from 'dompurify'

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input),
  },
}))

describe('TreeTitle', () => {
  const defaultProps = {
    title: {
      value: 'Test Title',
      isEditing: false,
    },
    treeTitle: 'Test Title',
    onTitleDraftChange: vi.fn(),
    onTitleEdit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('View Mode', () => {
    it('renders button with title in view mode', () => {
      render(<TreeTitle {...defaultProps} />)

      const button = screen.getByRole('button', { name: /Test Title - edit/i })
      expect(button).toBeVisible()
      expect(screen.getByText('Test Title')).toBeVisible()
    })

    it('calls onTitleEdit when button is clicked', async () => {
      const user = userEvent.setup()
      render(<TreeTitle {...defaultProps} />)

      await user.click(
        screen.getByRole('button', { name: /Test Title - edit/i })
      )
      expect(defaultProps.onTitleEdit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edit Mode', () => {
    const editModeProps = {
      ...defaultProps,
      title: { ...defaultProps.title, isEditing: true },
    }

    it('renders input in edit mode', () => {
      render(<TreeTitle {...editModeProps} />)

      const input = screen.getByRole('textbox', { name: 'Decision Tree Title' })
      expect(input).toBeVisible()
      expect(input).toHaveValue('Test Title')
    })

    it('calls onTitleDraftChange when text is entered', async () => {
      const user = userEvent.setup()
      render(<TreeTitle {...editModeProps} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'New Title')

      expect(defaultProps.onTitleDraftChange).toHaveBeenCalled()
    })

    it('sanitizes input value', () => {
      render(<TreeTitle {...editModeProps} />)

      expect(DOMPurify.sanitize).toHaveBeenCalledWith('Test Title')
    })

    it('saves on Enter without shift', async () => {
      const user = userEvent.setup()
      render(<TreeTitle {...editModeProps} />)

      const input = screen.getByRole('textbox')
      await user.type(input, '{Enter}')

      expect(defaultProps.onTitleEdit).toHaveBeenCalledTimes(1)
    })

    it('calls onTitleEdit when input loses focus', async () => {
      const user = userEvent.setup()
      render(<TreeTitle {...editModeProps} />)

      await user.tab() // Move focus away from input

      expect(defaultProps.onTitleEdit).toHaveBeenCalledTimes(1)
    })

    it('has correct accessibility attributes', () => {
      render(<TreeTitle {...editModeProps} />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'decisionTreeTitle')
      expect(screen.getByLabelText('Decision Tree Title')).toBeVisible()
    })
  })

  describe('Edge Cases', () => {
    it('prevents default on Enter without shift', async () => {
      const user = userEvent.setup()
      const preventDefaultSpy = vi.fn()

      render(
        <TreeTitle
          {...{
            ...defaultProps,
            title: { ...defaultProps.title, isEditing: true },
          }}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, '{Enter}')

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('automatically focuses input in edit mode', () => {
      render(
        <TreeTitle
          {...{
            ...defaultProps,
            title: { ...defaultProps.title, isEditing: true },
          }}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveFocus()
    })
  })
})
