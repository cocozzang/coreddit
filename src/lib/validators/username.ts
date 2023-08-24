import { z } from "zod"

const customErrorMessage =
  "사용자 이름은 영문자, 한글, 숫자, 밑줄(_)로만 구성되어야 합니다."

export const UsernameValidator = z.object({
  name: z
    .string()
    .min(3, { message: "이름은 최소 3자 이상이어야 합니다." })
    .max(32, { message: "이름은 최대 32자까지 가능합니다." })
    .refine((value) => /^[a-zA-Z가-힣0-9_]+$/.test(value), {
      message: customErrorMessage,
    }),
})

export type UsernameRequest = z.infer<typeof UsernameValidator>
