import React, { Component, ErrorInfo } from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  logError?: (payload: any) => Promise<void>
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error: ', error, errorInfo)
    this.setState({ hasError: true })
    this.props
      .logError?.({
        error,
        errorInfo,
      })
      .catch((apiError) => {
        console.error('Failed to log error to the API:', apiError)
      })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <section>
          <h1>Something went wrong.</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again?
          </button>
        </section>
      )
    }

    return this.props.children
  }
}

export { ErrorBoundary }
