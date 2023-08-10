import Link from "next/link"
import { toast } from "./useToast"
import { buttonVariants } from "@/components/ui/Button"

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "인증되지 않은 유저입니다.",
      description: "로그인이 필요합니다.",
      variant: "destructive",
      action: (
        <Link
          href={"/sign-in"}
          onClick={() => dismiss()}
          className={buttonVariants({ variant: "outline" })}
        >
          로그인
        </Link>
      ),
    })
  }

  return { loginToast }
}
