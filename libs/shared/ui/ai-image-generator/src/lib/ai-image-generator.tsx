'use client'
import { DpButton } from '@js-monorepo/button'
import { FormErrorMessage, Input } from '@js-monorepo/components/form'
import { useNotifications } from '@js-monorepo/notification'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function AiGeneratorImageSuspense({
  generateMethod,
}: {
  generateMethod: (prompt: string) => Promise<
    | {
        success: true
        data: string[]
      }
    | {
        success: false
        message: string
      }
  >
}) {
  const [predictions, setPrediction] = useState<string[] | null>(null)
  const [notificationId, setNotificationId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>()
  const [loading, setLoading] = useState(false)

  const { addNotification, removeNotification } = useNotifications()
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '')

  async function handleFormSubmission(inputPrompt: string) {
    setLoading(true)
    setError(null)

    const notId = addNotification({
      message: 'Generating AI image',
      type: 'spinner',
      duration: 60000,
    })

    setNotificationId(notId)

    const response = await generateMethod(inputPrompt)

    if (response.success) {
      setPrediction(response.data)
      const params = new URLSearchParams(searchParams)
      params.set('prompt', inputPrompt)
      replace(`?${params.toString()}`)
    } else {
      setLoading(false)
      setError(response.message || 'Something went wrong, Please try again...')
      removeNotification(notId)
      setPrediction(null)
    }
  }

  function onImageFinished() {
    setLoading(false)
    if (notificationId) {
      removeNotification(notificationId)
    }
  }

  return (
    <div className="text-foreground">
      <div className="flex justify-center">
        <form className="w-full sm:w-[40ch] gap-2">
          <Input placeholder="Enter your prompt" value={prompt} onChange={(event) => setPrompt(event.target?.value)} />

          <DpButton
            className="mt-3 w-full"
            size="large"
            type="submit"
            loading={loading}
            onClick={(event) => {
              event.preventDefault()
              if (prompt) {
                handleFormSubmission(prompt)
              }
            }}
          >
            Generate Image
          </DpButton>
        </form>
      </div>

      {error && (
        <section className="mt-8 flex justify-center">
          <FormErrorMessage errors={[error]}></FormErrorMessage>
        </section>
      )}

      {predictions && predictions?.length > 0 && (
        <section className="mt-4">
          <div className="flex flex-col items-center justify-center">
            {predictions.map((prediction) => (
              <div className="relative w-full aspect-square sm:w-[500px]" key={prediction}>
                <Image
                  src={prediction}
                  loading="lazy"
                  fill
                  style={{ objectFit: 'contain' }}
                  alt="Picture of the ai prediction"
                  className="object-cover w-full h-full rounded-md border-gray-300"
                  onLoadingComplete={onImageFinished}
                  onError={onImageFinished}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function AiGeneratorImage(props: {
  generateMethod: (prompt: string) => Promise<
    | {
        success: true
        data: string[]
      }
    | {
        success: false
        message: string
      }
  >
}) {
  return (
    <Suspense>
      <AiGeneratorImageSuspense {...props} />
    </Suspense>
  )
}
