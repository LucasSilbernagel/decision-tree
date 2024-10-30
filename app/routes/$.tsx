import { MetaFunction } from '@remix-run/node'
import FallbackPage from '~/components/FallbackPage/FallbackPage'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree | 404' },
    {
      name: 'description',
      content: 'A simple generator of shareable decision trees.',
    },
    {
      property: 'og:image',
      content: '/decision-tree.png',
    },
  ]
}

export default function PageNotFound() {
  return <FallbackPage />
}
