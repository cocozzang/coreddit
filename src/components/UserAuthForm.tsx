"use client"

import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Icons } from "./Icons"
import { toast } from "@/hooks/useToast"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export default function UserAuthForm({
  className,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loginWithGoogle = async () => {
    setIsLoading(true)

    try {
      await signIn("google")
    } catch (error) {
      toast({
        title: "오류! 재시도해주세용",
        description: "구글 로그인 시도 중 문제가 생겼습니당",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        onClick={loginWithGoogle}
        isLoading={isLoading}
        size="sm"
        className="w-full"
      >
        {isLoading ? null : <Icons.google className="h-4 w-4 mr-2" />}
        Google
      </Button>
    </div>
  )
}
