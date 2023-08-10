"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { CreateSubredditPayload } from "@/lib/validators/subreddit"
import { toast } from "@/hooks/useToast"
import { useCustomToast } from "@/hooks/useCustomToast"

interface PageProps {}

export default function Page({}: PageProps) {
  const router = useRouter()
  const { loginToast } = useCustomToast()
  const [input, setInput] = useState<string>("")

  const { mutate: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      }

      const { data } = await axios.post("/api/subreddit", payload)
      return data as string
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }

        if (err.response?.status === 409) {
          return toast({
            title: "다른 이름을 입력해주세요.",
            description: "해당 subreddit의 이름이 이미 존재합니다.",
            variant: "destructive",
          })
        }

        if (err.response?.status === 422) {
          return toast({
            title: "유효하지 않은 subreddit이름입니다.",
            description: "3글자 이상 21글자 이내로 입력해주세요.",
            variant: "destructive",
          })
        }
      }

      toast({
        title: "에러 현재 subreddit을 생성할 수 없습니다.",
        description: "나중에 재시도 해주세용.",
        variant: "destructive",
      })
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`)
    },
  })

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">커뮤니티 만들기</h1>
        </div>

        <hr className="bg-zinc-500 h-px" />

        <div>
          <div className="flex flex-col md:flex-row gap-2 pb-2 items-center">
            <div className="text-lg font-medium">이름</div>
            <div className="text-xs text-zinc-400">
              *subcoreddit 생성 이후에 해당 이름은 변경, 수정이 안됩니당.
            </div>
          </div>

          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              r/
            </p>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createCommunity()}
          >
            서브 꼬레딧 만들기
          </Button>

          <Button variant={"subtle"} onChange={() => router.back()}>
            뒤로가기
          </Button>
        </div>
      </div>
    </div>
  )
}
