type GoogleIconProps = {
  className?: string;
};

export function GoogleIcon({ className = 'h-5 w-5' }: GoogleIconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.12 0-5.77-2.1-6.71-4.93H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC04"
        d="M5.29 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.28a12 12 0 0 0 0 10.84l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.77l3.44-3.44C17.95 1.2 15.23 0 12 0 7.31 0 3.26 2.69 1.28 6.58l4 3.1c.94-2.83 3.59-4.9 6.72-4.9Z"
      />
    </svg>
  );
}
