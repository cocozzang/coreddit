"use client"

import { useCustomToast } from "@/hooks/useCustomToast"
import { usePrevious } from "@mantine/hooks"
import { VoteType } from "@prisma/client"
import { useEffect, useState } from "react"
import { Button } from "../ui/Button"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { PostVoteRequest } from "@/lib/validators/vote"
import axios, { AxiosError } from "axios"
import { toast } from "@/hooks/useToast"

interface PostVoteClientProps {
  postId: string
  initialVotesAmt: number
  initialVote?: VoteType | null
}

export default function PostVoteClient({
  initialVotesAmt,
  postId,
  initialVote,
}: PostVoteClientProps) {
  const { loginToast } = useCustomToast()
  const [voteAmt, setVoteAmt] = useState<number>(initialVotesAmt)
  const [currentVote, setCurrentVote] = useState(initialVote)
  const prevVote = usePrevious(currentVote)

  useEffect(() => {
    setCurrentVote(initialVote)
  }, [initialVote])

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      }

      await axios.patch("/api/subreddit/post/vote", payload)
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVoteAmt((prev) => prev - 1)
      else setVoteAmt((prev) => prev + 1)

      // reset current vote
      setCurrentVote(prevVote)

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }
      }

      return toast({
        title: "서버에러",
        description: "투표하기가 실패했습니다. 잠시 후 재시도해주세용.",
        variant: "destructive",
      })
    },

    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined)
        if (type === "UP") setVoteAmt((prev) => prev - 1)
        else if (type === "DOWN") setVoteAmt((prev) => prev + 1)
      } else {
        setCurrentVote(type)
        if (type === "UP") setVoteAmt((prev) => prev + (currentVote ? 2 : 1))
        else if (type === "DOWN")
          setVoteAmt((prev) => prev - (currentVote ? 2 : 1))
      }
    },
  })

  return (
    <div className="flex sm:flex-col gap-44 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button
        onClick={() => vote("UP")}
        size={"sm"}
        variant={"ghost"}
        aria-label="up-vote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {voteAmt}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        size={"sm"}
        variant={"ghost"}
        aria-label="up-vote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  )
}
