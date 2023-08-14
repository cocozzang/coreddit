import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostValidator } from "@/lib/validators/post"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    console.log("body!!", body)

    const { subredditId, title, content } = PostValidator.parse(body)

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id,
      },
    })

    if (!subscriptionExists) {
      return new Response("포스팅하기전에 해당 subreddit을 구독해야합니다.", {
        status: 400,
      })
    }

    await db.post.create({
      data: {
        title,
        subredditId,
        content,
        authorId: session.user.id,
      },
    })

    return new Response("OK")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("요청받은 포스팅 데이터가 유효하지 않습니다.", {
        status: 422,
      })
    }

    console.log(error)
    return new Response(
      "서버에러, 포스팅작성 실패. 잠시후 다시 시도해주세용.",
      {
        status: 500,
      }
    )
  }
}
