interface ErrorBannerProps {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="errBanner" role="alert">
      <span className="errBanner-icon" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="10" cy="13.4" r="0.9" fill="currentColor" />
        </svg>
      </span>
      <span>{message}</span>
    </div>
  )
}