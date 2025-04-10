import ContactForm from 'apps/tranquil-studio/components/contact'
import Image from 'next/image'

export default function Page() {
  return (
    <section className="flex flex-col items-center justify-center p-7 gap-2">
      <div className="relative h-12 sm:h-16 aspect-square">
        <Image alt="Contact us" src="/contact-us.png" fill className="object-contain"></Image>
      </div>
      <h1 className="mb-3">Contact Us</h1>
      <ContactForm></ContactForm>
    </section>
  )
}
