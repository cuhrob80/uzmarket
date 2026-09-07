interface JobCategoryIconProps {
  slug: string;
}

const iconPaths: Record<string, React.ReactNode> = {
  'jobs-sales-trade': <><path d="M4 7h16l-1 13H5L4 7Z"/><path d="M8 7a4 4 0 0 1 8 0M8 12h8"/></>,
  'jobs-transport-delivery-logistics-warehouse': <><path d="M3 7h11v10H3V7Zm11 4h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  'jobs-construction-repair': <><path d="m14 5 5 5M12 7l5-5 5 5-5 5M3 21l9-9 3 3-9 9H3v-3Z"/></>,
  'jobs-restaurants-cafes-hotels': <><path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18m0-18c3 2 4 5 4 8h-4"/></>,
  'jobs-production-skilled-trades': <><path d="M3 21V9l6 4V9l6 4V5h6v16H3Z"/><path d="M7 17h2m4 0h2m4 0h2"/></>,
  'jobs-agriculture': <><path d="M12 21V9"/><path d="M12 13C6 13 4 9 4 5c5 0 8 3 8 8Zm0 3c6 0 8-4 8-8-5 0-8 3-8 8Z"/></>,
  'jobs-auto-service': <><path d="m14 6 4-3 3 3-3 4-3-3-8 8 2 2-3 3-4-4 3-3 2 2 8-8-1-1Z"/></>,
  'jobs-it-internet-telecom': <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4M9 8l-2 2 2 2m6-4 2 2-2 2"/></>,
  'jobs-accounting-finance': <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2m3 0h3M8 15h2m3 0h3"/></>,
  'jobs-legal': <><path d="M12 3v18M5 6h14M7 6l-4 8h8L7 6Zm10 0-4 8h8l-4-8ZM8 21h8"/></>,
  'jobs-office-admin-hr': <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3m-4 5v3M3 12h18"/></>,
  'jobs-marketing-advertising-design': <><path d="m4 13 12-6v10L4 13Zm12-3 4-2v8l-4-2M6 14l2 6h4l-2-5"/></>,
  'jobs-medicine-pharmacy': <><path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3Z"/></>,
  'jobs-education-science': <><path d="m3 6 9-4 9 4-9 4-9-4Z"/><path d="M6 8v7c4 3 8 3 12 0V8m3-2v8"/></>,
  'jobs-security': <><path d="M12 3 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-5"/></>,
  'jobs-domestic-cleaning-services': <><path d="M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7"/><path d="m17 4 1-2m2 4 2-1"/></>,
  'jobs-beauty-fitness-sport': <><path d="M6 9v6m12-6v6M3 11v2m18-2v2M6 12h12"/><path d="M10 5c1-2 3-2 4 0"/></>,
  'jobs-other': <><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></>,
};

export function JobCategoryIcon({ slug }: JobCategoryIconProps) {
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
      {iconPaths[slug] ?? <path d="M4 8 12 4l8 4-8 4-8-4Zm0 0v8l8 4 8-4V8"/>}
    </svg>
  );
}
