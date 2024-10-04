import { Metadata } from 'next'
import { CardList } from './card-list'

export const metadata: Metadata = {
  title: 'FeedBack',
}

function FeedBack() {
  return (
    <section className="flex justify-center mt-2">
      <div className="space-y-7">
        <div>
          <h1 className="text-center p-2">How can we make the App better?</h1>
          <h4 className="text-center p-2">
            Below, you’ll find all the options to directly communicate your
            needs to our team.
          </h4>
        </div>
        <CardList className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"></CardList>
      </div>
    </section>
  )
}

export default FeedBack
