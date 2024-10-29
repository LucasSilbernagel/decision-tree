import { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { ArrowLeft } from 'lucide-react'
import Footer from '~/components/Footer/Footer'

export const meta: MetaFunction = () => {
  return [
    { title: 'Decision Tree | 404' },
    { name: 'description', content: 'A simple decision tree generator.' },
  ]
}

export default function PageNotFound() {
  return (
    <div className="mx-auto pt-6 text-center">
      <header>
        <h1 className="my-6 font-bold text-7xl">404</h1>
      </header>
      <main>
        <h2 className="text-4xl">Page not found.</h2>
        <div className="flex justify-center mt-6 mb-12 w-full">
          <div className="max-w-[200px]">
            <img src="/tree.webp" alt="" />
          </div>
        </div>
        <div className="mx-auto my-6 max-w-max">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 w-full font-bold text-2xl text-center underline underline-offset-2 hover:underline-offset-1 focus-visible:underline-offset-1 transition-all duration-300"
          >
            <ArrowLeft /> <span>Home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}