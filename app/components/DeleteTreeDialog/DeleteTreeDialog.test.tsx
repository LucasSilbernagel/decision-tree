import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeleteTreeDialog } from './DeleteTreeDialog'

describe('DeleteTreeDialog', () => {
  it('renders the trigger button with correct text and icon', () => {
    render(<DeleteTreeDialog handleReset={vi.fn()} />)
    const button = screen.getByRole('button', { name: /start over/i })
    expect(button).toBeVisible()
  })

  it('opens dialog when trigger button is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteTreeDialog handleReset={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /start over/i }))

    expect(screen.getByRole('heading', { name: /start over/i })).toBeVisible()
    expect(
      screen.getByText(/are you sure you want to start over\?/i)
    ).toBeVisible()
  })

  it('calls handleReset when Continue is clicked', async () => {
    const user = userEvent.setup()
    const mockHandleReset = vi.fn()
    render(<DeleteTreeDialog handleReset={mockHandleReset} />)

    await user.click(screen.getByRole('button', { name: /start over/i }))

    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(mockHandleReset).toHaveBeenCalledTimes(1)
  })

  it('closes dialog without calling handleReset when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const mockHandleReset = vi.fn()
    render(<DeleteTreeDialog handleReset={mockHandleReset} />)

    await user.click(screen.getByRole('button', { name: /start over/i }))

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockHandleReset).not.toHaveBeenCalled()

    expect(
      screen.queryByRole('heading', { name: /start over/i })
    ).not.toBeInTheDocument()
  })
})
