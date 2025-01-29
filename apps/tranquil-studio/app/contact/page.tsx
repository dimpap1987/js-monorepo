import ContactForm from 'apps/tranquil-studio/components/contact'
import Image from 'next/image'

export default function Page() {
  return (
    <section className="min-h-[70svh] flex flex-col items-center justify-center px-3 gap-2">
      <div className="relative h-12 sm:h-16 aspect-square">
        <Image alt="Contact us" src="/contact-us.png" fill style={{ objectFit: 'contain' }}></Image>
      </div>
      <h1>Contact Us</h1>
      <ContactForm></ContactForm>
    </section>
  )
}
