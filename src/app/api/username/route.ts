import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UsernameValidator } from "@/lib/validators/username"
import { z } from "zod"

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const { name } = UsernameValidator.parse(body)

    const username = await db.user.findFirst({
      where: {
        username: name,
      },
    })

    if (username) {
      return new Response("해당 닉네임이 이미 존재합니다.", { status: 409 })
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    })

    return new Response("OK")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        "유효하지 않은 닉네임입니다. 특수기호를 제외하고 3글자 이상 32글자 이내의 닉네임을 입력해주세요.",
        { status: 422 }
      )
    }

    console.log(error)
    return new Response(
      "서버에러, 닉네임변경에 실패하였습니다. 잠시후 시도해주세용.",
      {
        status: 500,
      }
    )
  }
}
