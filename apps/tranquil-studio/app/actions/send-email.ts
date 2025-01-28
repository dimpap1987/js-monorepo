'use server'

import { ContactFormSubmit } from '../types'

export async function sendEmail(data: ContactFormSubmit) {
  console.log('send email')
  console.log(data)
}
