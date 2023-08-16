import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redis } from "@/lib/redis"
import { PostVoteValidator } from "@/lib/validators/vote"
import { CachedPost } from "@/types/redis"
import { Redis } from "@upstash/redis"
import { z } from "zod"

const CACHE_AFTER_UPVOTES = 1

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, voteType } = PostVoteValidator.parse(body)

    const session = await getAuthSession()

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    })

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    })

    if (!post) {
      return new Response(
        "해당 postId는 존재하지 않습니다. postId를 다시 확인해주세요",
        { status: 404 }
      )
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        })
        return new Response("OK")
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      })

      // recount the votes
      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1
        if (vote.type === "DOWN") return acc - 1
        return acc
      }, 0)

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const chachePayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          creatdAt: post.createdAt,
        }

        await redis.hset(`post:${postId}`, chachePayload)
      }

      return new Response("OK")
    }

    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    })

    // recount the votes
    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1
      if (vote.type === "DOWN") return acc - 1
      return acc
    }, 0)

    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const chachePayload: CachedPost = {
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        creatdAt: post.createdAt,
      }
      await redis.hset(`post:${postId}`, chachePayload)
    }

    return new Response("OK")
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("postId 또는 voteType이 유효하지 않습니다.", {
        status: 422,
      })
    }

    console.log(error)
    return new Response(
      "서버에러, 현재 subreddit을 구독할 수 없습니다. 잠시후 시도해주세용.",
      {
        status: 500,
      }
    )
  }
}
