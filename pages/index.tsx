import Head from 'next/head'

//Sanity
import { sanityClient, urlFor } from '../sanity'

//Components
import Header from '../components/Header'

//Typescript
import { Post } from '../typings'
import Link from 'next/link'
interface Props {
  posts: [Post]
}

export default function Home({ posts }: Props) {
  return (
    <div className="mx-auto max-w-7xl">
      <Head>
        <title>Medium Blog || Showcase</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <div className="flex items-center justify-between border-y border-black bg-yellow-400 py-10 lg:py-0">
        <div className="space-y-5 px-10">
          <h1 className="max-w-xl font-serif text-6xl">
            <span className="underline decoration-black decoration-4">
              Medium
            </span>{' '}
            is a place to write, read and connect
          </h1>
          <h2>
            It's easy and free to post your thinking on any topic and connect
            with millions of readers.
          </h2>
        </div>

        <img
          className="hidden h-32 md:inline-flex lg:h-full"
          src="https://accountabilitylab.org/wp-content/uploads/2020/03/Medium-logo.png"
          alt=""
        />
      </div>

      <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:p-6">
        {posts.map((post) => (
          <Link href={`/post/${post.slug.current}`} key={post._id}>
            <div className="group cursor-pointer overflow-hidden rounded-lg border">
              {post.mainImage && (
                <img
                  className="h-60 w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-105 "
                  src={urlFor(post.mainImage).url()!}
                  alt=""
                />
              )}
              <div className="flex justify-between bg-white p-5">
                <div>
                  <p className="text-lg font-bold">{post.title}</p>
                  <p className="text-xs">
                    {post.description} by {post.author.name}
                  </p>
                </div>
                <img
                  className="h-12 w-12 rounded-full"
                  src={urlFor(post.author.image).url()!}
                  alt=""
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps = async () => {
  const query = `*[_type == "post"]{
      _id,
      title,
      author -> {
         name,
          imag
    },
      description,
      mainImage,
      slug,
      }`

  const posts = await sanityClient.fetch(query)

  return {
    props: {
      posts,
    },
  }
}
