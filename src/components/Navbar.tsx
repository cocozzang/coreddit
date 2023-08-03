import Link from "next/link"
import { Icons } from "./Icons"
import { buttonVariants } from "./ui/button"
import { getAuthSession } from "@/lib/auth"

interface NavbarProps {}

export default async function Navbar({}: NavbarProps) {
  const session = await getAuthSession()

  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-zinc-300 z-10 py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        {/* logo */}
        <Link href={"/"} className="flex gap-2 items-center">
          <Icons.logo className="h-8 w-8" />

          <p className="hidden text-zinc-700 text-sm font-medium md:block">
            Coreddit
          </p>
        </Link>

        {/* search bar */}

        {session?.user ? (
          <p>로그인이 됏음</p>
        ) : (
          <Link href={"/sign-in"} className={buttonVariants()}>
            로그인
          </Link>
        )}
      </div>
    </div>
  )
}
