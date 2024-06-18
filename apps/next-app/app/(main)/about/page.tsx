import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
}

function About() {
  return <div className="text-foreground">About Page</div>
}

export default About
