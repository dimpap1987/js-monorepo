import { Metadata } from 'next'
import { CardList } from './card-list'

export const metadata: Metadata = {
  title: 'FeedBack',
}

function FeedBack() {
  return (
    <section className="flex justify-center pt-5 md:pt-10 mt-10">
      <div className="space-y-7">
        <div>
          <h1 className="text-center p-2">How can we make the App better?</h1>
          <h4 className="text-center p-2">
            Below, you’ll find all the options to directly communicate your
            needs to our team.
          </h4>
        </div>
        <CardList className="flex justify-center gap-10 p-3 flex-wrap"></CardList>
      </div>
    </section>
  )
}

export default FeedBack
