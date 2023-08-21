"use client"

import { useState } from "react"
import { Label } from "./ui/Label"
import { Textarea } from "./ui/Textarea"
import { Button } from "./ui/Button"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { CommentRequest } from "@/lib/validators/comments"
import { useCustomToast } from "@/hooks/useCustomToast"
import { toast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"

interface CreateCommentProps {
  postId: string
  replyToId?: string
}

export default function CreateComment({
  postId,
  replyToId,
}: CreateCommentProps) {
  const router = useRouter()
  const { loginToast } = useCustomToast()
  const [input, setInput] = useState<string>("")

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      }

      const { data } = await axios.patch(`/api/subreddit/post/comment`, payload)
      return data
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }

        return toast({
          title: "서버오류",
          description: "잠시후 재시도 해주세용.",
          variant: "destructive",
        })
      }
    },
    onSuccess: () => {
      router.refresh()
      setInput("")
    },
  })

  return (
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

        <div className="mt-2 flex justify-end">
          <Button
            onClick={() => postComment({ postId, text: input, replyToId })}
            isLoading={isLoading}
            disabled={input.length === 0}
          >
            작성하기
          </Button>
        </div>
      </div>
    </div>
  )
}
