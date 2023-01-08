// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@api'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  res.status(200).json({
    avatar: null,
    id: "123",
    email: "example@email.com",
    username: "username_example123",
    created_date: new Date(),
    password: "an_secure_password_with_numbers_2913i44"
  })
}
