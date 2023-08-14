import { z } from "zod"

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, { message: "제목은 3글자 이상이어야 합니다." })
    .max(128, { message: "제목은 128글자 이내여야합니다." }),
  subredditId: z.string(),
  content: z.any(),
})

export type PostCreationRequest = z.infer<typeof PostValidator>
