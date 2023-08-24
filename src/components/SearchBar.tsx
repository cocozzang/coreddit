"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command"
import { useCallback, useState } from "react"
import axios from "axios"
import { Prisma, Subreddit } from "@prisma/client"
import { CommandEmpty } from "cmdk"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import debounce from "lodash.debounce"

interface SearchBarProps {}

export default function SearchBar({}: SearchBarProps) {
  const router = useRouter()

  const [input, setInput] = useState<string>("")

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return []
      const { data } = await axios.get(`/api/search?q=${input}`)
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType
      })[]
    },
    queryKey: ["search-query", input],
    enabled: false,
  })

  const request = debounce(() => {
    refetch()
  }, 300)

  const debouncedRequest = useCallback(() => {
    request()
  }, [request])

  return (
    <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text)
          debouncedRequest()
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="검색"
      />
      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && (
            <CommandEmpty className="p-2 text-zinc-400">
              해당 검색어와 일치하는 결과가 없습니다.
            </CommandEmpty>
          )}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="커뮤니티">
              {queryResults?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  onSelect={(e) => {
                    router.push(`/r/${e}`)
                    router.refresh()
                  }}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  )
}
