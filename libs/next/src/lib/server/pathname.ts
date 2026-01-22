'use server'

import { headers } from 'next/headers'

const getServerPathname = () => headers().get('x-pathname')

export { getServerPathname }
