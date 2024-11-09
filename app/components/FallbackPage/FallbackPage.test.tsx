import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FallbackPage from './FallbackPage'
import React from 'react'

vi.mock('@remix-run/react', () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode
    to: string
    className: string
  }) => (
    <a href={to} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}))

describe('FallbackPage', () => {
  it('renders correctly', () => {
    render(<FallbackPage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('404')
    const subheading = screen.getByRole('heading', { level: 2 })
    expect(subheading).toHaveTextContent('Page not found.')
    const image = screen.getByRole('presentation')
    expect(image).toHaveAttribute('src', '/tree.webp')
    expect(image).toHaveAttribute('alt', '')
    expect(screen.getByTestId('mock-link')).toHaveTextContent('Home')
    expect(screen.getByTestId('mock-link')).toHaveAttribute('href', '/')
    expect(screen.getByText('Built by')).toBeVisible()
    expect(screen.getByText('Lucas Silbernagel')).toBeVisible()
    expect(screen.getByText('Lucas Silbernagel')).toHaveAttribute(
      'href',
      'https://lucassilbernagel.com/'
    )
  })
})
