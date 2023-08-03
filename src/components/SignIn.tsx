import Link from "next/link"
import { Icons } from "./Icons"
import UserAuthForm from "./UserAuthForm"

export default function SignIn() {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-7 w-7" />
        <h1 className="text-2xl font-semibold tracking-tighter">
          Welcome back
        </h1>
        <p className="text-sm max-w-xs mx-auto">로그인하셈</p>

        {/* sign in form */}
        <UserAuthForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          꼬레딧이 처음인가용?
          <Link
            href={"/sign-up"}
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
