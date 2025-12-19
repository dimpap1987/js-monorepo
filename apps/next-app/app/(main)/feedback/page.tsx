import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'
import { CardList } from './card-list'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Feedback',
  description: 'Share your feedback and help us improve. We value your input and suggestions to make the app better.',
  keywords: ['feedback', 'suggestions', 'improvements', 'contact'],
  type: 'website',
})

function FeedBack() {
  return (
    <ContainerTemplate>
      <section className="flex justify-center mt-2">
        <div className="space-y-7 p-2">
          <div>
            <h2 className="text-center p-2">How can we make the App better?</h2>
            <h4 className="text-center p-2 hidden sm:block">
              Below, you’ll find all the options to directly communicate your needs to our team.
            </h4>
          </div>
          <CardList className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"></CardList>
        </div>
      </section>
    </ContainerTemplate>
  )
}

export default FeedBack
