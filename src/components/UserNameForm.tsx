"use client"

import { UsernameRequest, UsernameValidator } from "@/lib/validators/username"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card"
import { Label } from "./ui/Label"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useCustomToast } from "@/hooks/useCustomToast"
import { toast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"

interface UserNameFormProps {
  user: Pick<User, "id" | "username">
}

export default function UserNameForm({ user }: UserNameFormProps) {
  const router = useRouter()
  const { loginToast } = useCustomToast()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  })

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name }
      const { data } = await axios.patch(`/api/username`, payload)
      return data
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast()
        }

        if (err.response?.status === 409) {
          return toast({
            title: "다른 이름을 입력해주세요.",
            description: "해당 닉네임이 이미 존재합니다.",
            variant: "destructive",
          })
        }

        if (err.response?.status === 422) {
          return toast({
            title: "유효하지 않은 닉네임입니다.",
            description:
              "특수기호를 제외한 3글자 이상 32이내의 닉네임을 입력해주세용 ",
            variant: "destructive",
          })
        }
      }

      toast({
        title: "닉네임을 변경할 수 없습니다",
        description: "잠시후 다시 시도해주세용.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      toast({
        description: "닉네임이 변경되었습니다.",
      })
      router.refresh()
    },
  })

  return (
    <form
      onSubmit={handleSubmit((e) => {
        updateUsername(e)
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>닉네임</CardTitle>
          <CardDescription>
            변경하고자 하는 닉네임을 적어주세용.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              닉네임
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading} disabled={!!errors.name?.message}>
            변경하기
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
