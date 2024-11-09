import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BackToStartButton } from './BackToStartButton'

describe('BackToStartButton', () => {
  it('renders correctly', async () => {
    const mockHandleClick = vi.fn()

    render(<BackToStartButton onClick={mockHandleClick} />)

    expect(screen.getByText('Back to start')).toBeVisible()
    await userEvent.click(screen.getByText('Back to start'))
    expect(mockHandleClick).toHaveBeenCalledTimes(1)
  })
})
