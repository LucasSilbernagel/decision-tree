import { MetaFunction } from '@remix-run/node'
import FallbackPage from '~/components/FallbackPage/FallbackPage'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree | 404' },
    {
      name: 'description',
      content:
        'Decision Tree is simple generator of shareable and accessible decision trees. Decision tree data is serialized and saved in the URL, making it easy to share and save created decision trees.',
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
