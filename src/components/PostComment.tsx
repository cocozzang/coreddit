"use client"

import { useRef, useState } from "react"
import UserAvatar from "./UserAvatar"
import { Comment, CommentVote, User } from "@prisma/client"
import { formatTimeToNow } from "@/lib/utils"
import CommentVotes from "./CommentVotes"
import { Button } from "./ui/Button"
import { MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Label } from "./ui/Label"
import { Textarea } from "./ui/Textarea"
import { useMutation } from "@tanstack/react-query"
import { CommentRequest } from "@/lib/validators/comments"
import axios from "axios"
import { toast } from "@/hooks/useToast"

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
}

interface PostCommentProps {
  comment: ExtendedComment
  votesAmt: number
  currentVote: CommentVote | undefined
  postId: string
}

export default function PostComment({
  comment,
  votesAmt,
  currentVote,
  postId,
}: PostCommentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState<boolean>(false)
  const [input, setInput] = useState<string>("")

  const commentRef = useRef<HTMLDivElement>(null)

  const { mutate: postReplyingComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      }

      const { data } = await axios.patch(`/api/subreddit/post/comment`, payload)
      return data
    },
    onError: () => {
      return toast({
        title: "댓글작성에 실패했습니다.",
        description: "잠시후 다시 시도해주세용.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      router.refresh()
      setIsReplying(false)
    },
  })

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>

          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-900 mt-2 ml-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in")
            setIsReplying(true)
          }}
          variant={"ghost"}
          size={"xs"}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          답글달기
        </Button>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label>댓글</Label>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="comment">Comment</Label>
              <div className="mt-2">
                <Textarea
                  id="comment"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="댓글을 작성해보세요..."
                />

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant={"subtle"}
                    onClick={() => {
                      setIsReplying(false)
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={() => {
                      if (!input) return
                      postReplyingComment({
                        postId,
                        text: input,
                        replyToId: comment.replyToId ?? comment.id,
                      })
                    }}
                    isLoading={isLoading}
                    disabled={input.length === 0}
                  >
                    작성하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
