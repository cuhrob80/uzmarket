interface TransportCategoryIconProps {
  slug: string;
}

const iconPaths: Record<string, React.ReactNode> = {
  'transport-passenger-cars': <><path d="M7 17h10l2-5-3-4H8l-3 4 2 5Z"/><path d="M5 12h14M9 8l-1.5 4m7.5-4 1.5 4"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></>,
  'transport-car-parts-accessories': <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.8-1L14.4 3h-4.8l-.4 3.1a8 8 0 0 0-1.8 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2L3 14.5l2 3.4 2.4-1a8 8 0 0 0 1.8 1l.4 3.1h4.8l.4-3.1a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2.1-1.5c.1-.3.1-.7.1-1Z"/></>,
  'transport-tires-rims-wheels': <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5m0 6v5M4 12h5m6 0h5M6.3 6.3l3.5 3.5m4.4 4.4 3.5 3.5m0-11.4-3.5 3.5m-4.4 4.4-3.5 3.5"/></>,
  'transport-motorcycles': <><circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="m6 16 4-7h4l4 7m-8-7 3 7H6m7 0h5M8 7h3m5 1 2 2"/></>,
  'transport-motorcycle-parts-accessories': <><path d="m14 6 4-3 3 3-3 4-3-3-8 8 2 2-3 3-4-4 3-3 2 2 8-8-1-1Z"/></>,
  'transport-personal-mobility': <><circle cx="7" cy="18" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="M7 18h7l3-8h-5m5 0-1-5h3M9 8h3"/></>,
  'transport-trucks': <><path d="M3 7h11v10H3V7Zm11 4h4l3 3v3h-7v-6Z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  'transport-buses': <><path d="M5 3h14v15H5V3Z"/><path d="M7 6h10v6H7V6Zm0 9h2m6 0h2"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/></>,
  'transport-special-machinery': <><path d="M3 15h12l3 3H6l-3-3Zm4-1V7h7l3 7H7Zm7-7 3-2 2 1-2 4"/><circle cx="9" cy="11" r="1.5"/></>,
  'transport-agricultural-machinery': <><circle cx="7" cy="17" r="4"/><circle cx="18" cy="18" r="2.5"/><path d="M7 13V8h7l3 7H9m3-7V4h3l2 4"/></>,
  'transport-trailers': <><path d="M3 7h14v9H3V7Zm14 6h3l1 2v1h-4"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></>,
  'transport-heavy-machinery-parts': <><path d="M4 7h9v10H4V7Zm9 3h4l3 3v4h-7"/><path d="M7 10h3v4H7z"/><circle cx="8" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  'transport-watercraft': <><path d="m3 14 3 5h11l4-7H8l-2-5h7l3 5"/><path d="M4 21c2-1 3-1 5 0s3 1 5 0 3-1 5 0"/></>,
};

export function TransportCategoryIcon({ slug }: TransportCategoryIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="72"
      height="72"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
    >
      {iconPaths[slug] ?? <><path d="M4 8 12 4l8 4-8 4-8-4Z"/><path d="m4 8v8l8 4 8-4V8M12 12v8"/></>}
    </svg>
  );
}
