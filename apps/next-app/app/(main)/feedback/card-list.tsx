'use client'

import { DpButton } from '@js-monorepo/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@js-monorepo/components'

function CardList({ className }: { className: string }) {
  return (
    <div className={className}>
      <Card
        className="bg-slate-100 text-base font-light
         text-black shadow-md shadow-primary w-[360px] p-3 
         flex flex-col justify-between"
      >
        <CardHeader>
          <CardTitle>🐛 Report a bug</CardTitle>
        </CardHeader>
        <CardContent className="">
          <p>Uh oh. Is something broken?</p>
          <p> Please help us fix it by submitting an issue!</p>
        </CardContent>
        <CardFooter>
          <DpButton
            className="w-full"
            size="large"
            onClick={() =>
              window.open(
                'https://github.com/dimpap1987/js-monorepo/issues/new/choose',
                '_blank'
              )
            }
          >
            Report
          </DpButton>
        </CardFooter>
      </Card>

      <Card
        className="bg-slate-100 text-base font-light
         text-black shadow-md shadow-primary w-[360px] p-3 
         flex flex-col justify-between"
      >
        <CardHeader>
          <CardTitle>💡 Feature request</CardTitle>
        </CardHeader>
        <CardContent className="">
          <p>Have an idea for a new feature?</p>
          <p>Click below to submit it!</p>
        </CardContent>
        <CardFooter>
          <DpButton
            size="large"
            className="w-full"
            onClick={() =>
              window.open(
                'https://github.com/dimpap1987/js-monorepo/issues/new/choose',
                '_blank'
              )
            }
          >
            Make Request
          </DpButton>
        </CardFooter>
      </Card>
    </div>
  )
}

export { CardList }
