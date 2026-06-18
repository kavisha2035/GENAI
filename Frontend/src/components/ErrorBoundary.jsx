import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
        this.setState({ errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <div className="error-boundary-card">
                        <div className="error-icon"></div>
                        <h1>Something went wrong</h1>
                        <p className="error-description">
                            The application encountered an unexpected error. This has been logged and we'll look into it.
                        </p>
                        {this.state.error && (
                            <details className="error-details">
                                <summary>Technical Details</summary>
                                <pre>{this.state.error.toString()}</pre>
                                {this.state.errorInfo && (
                                    <pre className="error-stack">{this.state.errorInfo.componentStack}</pre>
                                )}
                            </details>
                        )}
                        <div className="error-actions">
                            <button className="error-btn primary" onClick={this.handleReset}>
                                Try Again
                            </button>
                            <button className="error-btn secondary" onClick={() => window.location.href = '/'}>
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
