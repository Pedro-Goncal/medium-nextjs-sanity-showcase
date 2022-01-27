import { GetStaticProps } from 'next'

//Portable text
import PortableText from 'react-portable-text'

//Components
import Header from '../../components/Header'

//Sanity
import { sanityClient, urlFor } from '../../sanity'

//React Hook Form
import { useForm, SubmitHandler } from 'react-hook-form'

//TypeScript
import { Post } from '../../typings'
import { useState } from 'react'

interface Props {
  post: Post
}

interface IFormInput {
  _id: string
  name: string
  email: string
  comment: string
  err?: string
}

const Post = ({ post }: Props) => {
  const [submitted, setSubmitted] = useState(false)
  console.log(post)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>()

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(res)
        setSubmitted(true)
      })
      .catch((err) => {
        console.log(err)
        setSubmitted(false)
      })
  }

  return (
    <main>
      <Header />
      <img
        className="h-96 w-full object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="mx-auto max-w-3xl p-5">
        <h1 className="mt-10 mb-3 text-3xl">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500">{post.description}</h2>
        <div className="flex items-center space-x-2 ">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog post by{' '}
            <span className="text-green-600">{post.author.name}</span> - Publish
            at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            className="text-justify"
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props} />
              ),
              normal: ({ children }: any) => <p className="py-2">{children}</p>,
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-fuchsia-700 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="my-5 mx-auto max-w-lg border border-fuchsia-600" />

      {submitted ? (
        <div className="my-10 mx-auto flex max-w-2xl flex-col bg-fuchsia-600 p-10 text-center text-white">
          <h3 className="py-2 text-3xl font-bold">
            Thank you for submitting your comment.
          </h3>
          <p>Once it has been approved, it will appear bellow!</p>
        </div>
      ) : (
        <form
          className="my-10 mx-auto mb-10 flex  max-w-2xl flex-col p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="text-sm text-fuchsia-700">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below!</h4>
          <hr className="mt-2 py-3" />

          <input
            {...register('_id')}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <label className="mb-5 block">
            <span className="text-gray-700 ">Name</span>
            <input
              {...register('name', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow  outline-none ring-fuchsia-600 focus:ring-1"
              placeholder="Name"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700 ">Email</span>
            <input
              {...register('email', { required: true })}
              className="form-input mt-1 block w-full rounded border py-2 px-3 shadow  outline-none  ring-fuchsia-600 focus:ring-1 "
              placeholder="Email"
              type="text"
            />
          </label>
          <label className="mb-5 block">
            <span className="text-gray-700 ">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="form-textarea mt-1 block w-full rounded border py-2 px-3 shadow outline-none ring-fuchsia-600  focus:ring-1"
              placeholder="Comment"
              rows={8}
            />
            <div className="flex flex-col p-5">
              {errors.name && (
                <span className="text-orange-700">
                  -The Name field is requiered
                </span>
              )}
              {errors.email && (
                <span className="text-orange-700">
                  -The Email field is requiered
                </span>
              )}
              {errors.comment && (
                <span className="text-orange-700">
                  -The Comment field is requiered
                </span>
              )}
            </div>
          </label>
          <input
            className="focus:shadow-outline cursor-pointer rounded bg-fuchsia-600 py-2 px-4 text-white shadow hover:bg-fuchsia-500 focus:outline-none"
            type="submit"
            value="Submit"
          />
        </form>
      )}
      {/* Comments */}
      <div className="my-10 mx-auto flex max-w-2xl flex-col space-y-2 p-10 shadow shadow-fuchsia-700">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2 " />

        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p className="">
              <span className="text-fuchsia-600">{comment.name}: </span>
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug {
    current
      }
    }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == "my-first-post"][0]{
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image,
     },
  "comments": *[
    _type == "comment" &&
    post._ref == ^._id &&
    approved == true
  ],
    description,
  mainImage,
  slug,
  body
    }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  })

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60, //After 60 seconds it will update cache
  }
}
