import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubredditValidator } from "@/lib/validators/subreddit"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { name } = SubredditValidator.parse(body)

    const subredditExists = await db.subreddit.findFirst({
      where: {
        name,
      },
    })

    if (subredditExists) {
      return new Response("해당이름의 subreddit이 이미 존재합니다.", {
        status: 409,
      })
    }

    const subreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: subreddit.id,
      },
    })

    return new Response(subreddit.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        "유효하지 않은 subreddit 이름입니다. 3글자 이상 21글자 이내로 이름을 정하세요",
        { status: 422 }
      )
    }

    console.log(error)
    return new Response("subreddit을 생성할수없습니다.", { status: 500 })
  }
}
