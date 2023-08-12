import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubredditSubscriptionValidator } from "@/lib/validators/subreddit"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    console.log(body)

    const { subredditId } = SubredditSubscriptionValidator.parse(body)

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscriptionExists) {
      return new Response("해당 subreddit을 구독하고 있지 않습니다.", {
        status: 400,
      })
    }

    // 구독취소하려는 유저가 subreddit 생성자일 경우
    const subreddit = await db.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: session.user.id,
      },
    })

    if (subreddit) {
      return new Response("subreddit 최초 생성자는 구독취소가 불가능합니다.", {
        status: 400,
      })
    }

    await db.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id,
        },
      },
    })

    return new Response(subredditId)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("유효하지 않은 subreddit ID 입니다.", { status: 422 })
    }

    console.log(error)
    return new Response(
      "서버에러, 현재 subreddit의 구독 취소를 할 수 없습니다. 잠시후 시도해주세용.",
      {
        status: 500,
      }
    )
  }
}

// TODO: 존재하지 않는 subredditId가 req에서 넘어올떄의 에러처리
