import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle"
import { buttonVariants } from "@/components/ui/Button"
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default async function Layout({
  children,
  params: { slug },
}: LayoutProps) {
  const session = await getAuthSession()

  const subreddit = await db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
      Creator: {
        select: {
          name: true,
        },
      },
    },
  })

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      })

  const isSubscribed = !!subscription

  if (!subreddit) return notFound()

  const memberCount = await db.subscription.count({
    where: {
      subreddit: {
        name: slug,
      },
    },
  })

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        {/* TODO: Button to take us back */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          {/* info side bar */}
          <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About r/{subreddit.name}</p>
            </div>

            <dl className="px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Creted</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "yyyy년 MM월 dd일")}
                  </time>
                </dd>
              </div>

              <hr />

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Mebers</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              <hr />

              <div className=" flex justify-between gap-x-4 py-3">
                <p className="text-gray-500">
                  {subreddit.Creator?.name} 님이 만든 subreddit입니다.
                </p>
              </div>

              {subreddit.creatorId !== session?.user.id && (
                <SubscribeLeaveToggle
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                  isSubscribed={isSubscribed}
                />
              )}

              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mb-6",
                })}
                href={`/r/${slug}/submit`}
              >
                포스트 작성하기
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
