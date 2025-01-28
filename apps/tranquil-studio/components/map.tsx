const MapWithIframe = ({ href }: { href: string }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-96">
      <iframe
        src={href}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map"
      ></iframe>
    </div>
  )
}

export default MapWithIframe
