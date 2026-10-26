export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 224 224" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M51.8 25.2002H124.6C133 25.2002 140 28.0002 147 35.0002L182 70.0002C189 77.0002 191.8 84.0002 191.8 93.8002V130.2C191.8 158.2 172.2 177.8 142.8 177.8H93.8V203C93.8 206.734 91.9333 208.6 88.2 208.6H51.8C48.0667 208.6 46.2 206.734 46.2 203V30.8002C46.2 27.0669 48.0667 25.2002 51.8 25.2002ZM93.8 70.0002V133H137.2C142.8 133 147 128.8 147 123.2V100.8C147 96.6002 145.6 93.8002 142.8 91.0002L124.6 72.8002C123.2 71.4002 120.4 70.0002 117.6 70.0002H93.8Z"
          fillRule="evenodd"
          clipRule="evenodd"
          fill="url(#brand-fold-main)"
        />
        <path
          d="M25.2 49H35V191.8H29.4C23.8 191.8 19.6 187.6 19.6 182V54.6C19.6 50.8667 21.4666 49 25.2 49Z"
          fill="url(#brand-fold-bar)"
        />
        <defs>
          <linearGradient id="brand-fold-main" x1="51.8" y1="28.0002" x2="184.8" y2="205.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9B9FF0" />
            <stop offset="0.46" stopColor="#6168CF" />
            <stop offset="1" stopColor="#3D4497" />
          </linearGradient>
          <linearGradient id="brand-fold-bar" x1="22.4" y1="50.4" x2="35" y2="191.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A8ADF3" />
            <stop offset="1" stopColor="#6168CF" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}
