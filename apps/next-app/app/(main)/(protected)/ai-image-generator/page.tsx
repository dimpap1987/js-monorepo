import { ContainerTemplate } from '@js-monorepo/templates'
import { AiGeneratorImage } from '@js-monorepo/ai-image-generator'
import { predict } from '@next-app/actions/predict'

export const metadata = {
  title: 'AI Image Generator',
}

export default function PageAiImageGenerator() {
  return (
    <ContainerTemplate>
      <AiGeneratorImage generateMethod={predict}></AiGeneratorImage>
    </ContainerTemplate>
  )
}
