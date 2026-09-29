type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconDashboard = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconPosts = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

export const IconMedia = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
    <path d="m14 15 1.6-1.6a2 2 0 0 1 2.8 0L20 15" />
  </svg>
);

export const IconFolder = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const IconTag = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M20.6 13.4 12 4.8A2 2 0 0 0 10.6 4H5a1 1 0 0 0-1 1v5.6a2 2 0 0 0 .6 1.4l8.6 8.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8z" />
    <circle cx="8" cy="8" r="1.3" />
  </svg>
);

export const IconGear = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
  </svg>
);

export const IconSearch = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconBell = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

export const IconPlus = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconUpload = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M12 4v12" />
  </svg>
);

export const IconEdit = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconTrash = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const IconFile = ({ size = 26 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
);

export const IconCheck = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const IconShield = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3 5 6v6c0 4.5 3 8.2 7 9 4-.8 7-4.5 7-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconClock = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconArchive = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
    <path d="M10 12h4" />
  </svg>
);

export const IconMenu = ({ size = 20 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const IconBook = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const IconImage = ({ size = 24 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
    <path d="m14 15 1.6-1.6a2 2 0 0 1 2.8 0L20 15" />
  </svg>
);

export const IconLogout = ({ size = 17 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconSpinner = ({ size = 16 }: IconProps) => (
  <svg {...base(size)} className="spin">
    <path d="M21 12a9 9 0 1 1-6.2-8.6" />
  </svg>
);
