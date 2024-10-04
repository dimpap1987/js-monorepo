function DpLogo({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className="hover:cursor-pointer">
      {children}
    </div>
  )
}

DpLogo.displayName = 'DpLogo'

export { DpLogo }
