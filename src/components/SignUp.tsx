import Link from "next/link"
import { Icons } from "./Icons"
import UserAuthForm from "./UserAuthForm"

export default function SignUp() {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-7 w-7" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome Coreddit
        </h1>
        <p className="text-sm max-w-xs mx-auto">회원가입하셈</p>

        {/* sign in form */}
        <UserAuthForm />

        <p className="px-8 text-center text-sm text-muted-foreground">
          <div className="mb-1">이미 회원가입을 하셨나용?</div>
          <Link
            href={"/sign-in"}
            className="hover:text-black text-sm underline underline-offset-2"
          >
            호다닥 로그인하러가기
          </Link>
        </p>
      </div>
    </div>
  )
}
