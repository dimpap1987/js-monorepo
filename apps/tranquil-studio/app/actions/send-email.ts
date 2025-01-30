'use server'

import nodemailer from 'nodemailer'
import { ContactFormSubmit } from '../types'

export async function sendEmail(data: ContactFormSubmit) {
  try {
    const { name, email, message } = data

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Contact Form Submission from ${name}`,
      text: `Sender: ${email}\n\nMessage:\n${message}`,
    })

    console.log('successfully email send')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error sending email')
    return {
      success: false,
    }
  }
}
