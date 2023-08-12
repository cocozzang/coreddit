"use client"

import { useMutation } from "@tanstack/react-query"
import { Button } from "./ui/Button"
import { SubscribeToSubredditPayload } from "@/lib/validators/subreddit"
import axios, { AxiosError } from "axios"
import { useCustomToast } from "@/hooks/useCustomToast"
import { toast } from "@/hooks/useToast"
import { startTransition } from "react"
import { useRouter } from "next/navigation"

interface SubscribeLeaveToggleProps {
  subredditId: string
  subredditName: string
  isSubscribed: boolean
}

export default function SubscribeLeaveToggle({
  subredditId,
  subredditName,
  isSubscribed,
}: SubscribeLeaveToggleProps) {
  const router = useRouter()
  const { loginToast } = useCustomToast()

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      }

      const { data } = await axios.post("/api/subreddit/subscribe", payload)
      return data as string
    },
    onError: (err) => {
      // 1 로그인하지 않은 유저 에러한들링
      // (request params가 잘못보내졋을떄 에러핸들링)
      // 2-1 이미 구독중인거 또 구독질할떄
      // 2-2 존재하지 않는 subredditId를 구독질 할떄 또는 subredditId가 zod validator 통과를 하지 못할떄
      // 3. ㄹㅇ루다가 서버과부하문제 또는 알 수 없는 경우에 대한 에러핸들링
      // 총 4가지의 경우에 대해 에러핸들링을 진행합니다.
      // TODO: 2-1, 2-2 에러핸들링 추가하기

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
      startTransition(() => {
        router.refresh()
      })

      return toast({
        title: "구독성공",
        description: `r/${subredditName} 을 구독하셨습니다.`,
      })
    },
  })

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      }

      const { data } = await axios.post("/api/subreddit/unsubscribe", payload)
      return data as string
    },
    onError: (err) => {
      // 1 로그인하지 않은 유저 에러한들링
      // (request params가 잘못보내졋을떄 에러핸들링)
      // 2-1 이미 구독중인거 또 구독질할떄
      // 2-2 존재하지 않는 subredditId를 구독질 할떄 또는 subredditId가 zod validator 통과를 하지 못할떄
      // 3. ㄹㅇ루다가 서버과부하문제 또는 알 수 없는 경우에 대한 에러핸들링
      // 총 4가지의 경우에 대해 에러핸들링을 진행합니다.
      // TODO: 2-1, 2-2 에러핸들링 추가하기

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
      startTransition(() => {
        router.refresh()
      })

      return toast({
        title: "구독 취소",
        description: `r/${subredditName} 을 구독 취소하셨습니다.`,
      })
    },
  })

  return isSubscribed ? (
    <Button
      isLoading={isUnsubLoading}
      onClick={() => unsubscribe()}
      className="w-full mt-1 mb-4"
      variant={"destructive"}
    >
      구독취소
    </Button>
  ) : (
    <Button
      isLoading={isSubLoading}
      onClick={() => subscribe()}
      className="w-full mt-1 mb-4"
    >
      구독하기
    </Button>
  )
}
