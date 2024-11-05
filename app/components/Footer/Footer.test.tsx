import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'

describe('Footer', () => {
  it('renders correctly', async () => {
    render(<Footer />)
    expect(screen.getByText('Built by')).toBeVisible()
    expect(screen.getByText('Lucas Silbernagel')).toBeVisible()
    expect(screen.getByText('Lucas Silbernagel')).toHaveAttribute(
      'href',
      'https://lucassilbernagel.com/'
    )
  })
})
