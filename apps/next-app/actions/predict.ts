'use server'

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_TOKEN,
})

export interface ReplicateResponseSuccess {
  success: true
  data: string[]
}

export interface ReplicateResponseFailure {
  success: false
  message: string
}

type ReplicateResponse = ReplicateResponseSuccess | ReplicateResponseFailure

export async function predict(prompt: string): Promise<ReplicateResponse> {
  if (!prompt || prompt?.trim() === '') {
    return {
      success: false,
      message: 'Provide valid Prompt...',
    }
  }

  const input = {
    prompt: prompt,
    height: 1024,
    width: 1024,
    disable_safety_checker: true,
  }
  try {
    const output = await replicate.run(
      'bytedance/sdxl-lightning-4step:727e49a643e999d602a896c774a0658ffefea21465756a6ce24b7ea4165eba6a',
      { input }
    )
    return {
      success: true,
      data: output as string[],
    }
  } catch (e: any) {
    console.error(e, 'Error while generating AI image', e.stack)
    return {
      success: false,
      message: 'Something went wrong, while generating AI image...',
    }
  }
}
