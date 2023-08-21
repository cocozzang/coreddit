import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { CommentValidator } from "@/lib/validators/comments"
import { z } from "zod"

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, text, replyToId } = CommentValidator.parse(body)

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    })

    return new Response("OK")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("요청받은 댓글 데이터가 유효하지 않습니다.", {
        status: 422,
      })
    }

    console.log(error)
    return new Response("서버에러, 댓글작성 실패. 잠시후 다시 시도해주세용.", {
      status: 500,
    })
  }
}
