import React from 'react';

/**
 * High-Resolution Vector Replica of the Official MUSF Emblem / Logo
 * Features: Blue Globe with Latitude/Longitude, "MUSF" Bold Text,
 * Open Book with Pen Nib at the base, and Laurel Branches.
 */
export const MusfEmblemSvg = ({ className = "w-24 h-24", color = "#002B7F" }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MUSF Official Emblem"
    >
      {/* Outer Decorative Ring */}
      <circle cx="100" cy="85" r="56" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="100" cy="85" r="51" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

      {/* Globe Sphere Meridians & Parallels */}
      <circle cx="100" cy="85" r="46" stroke={color} strokeWidth="2.5" fill="none" />
      
      {/* Prime Meridian & Horizontal Equator */}
      <line x1="100" y1="39" x2="100" y2="131" stroke={color} strokeWidth="2" />
      <line x1="54" y1="85" x2="146" y2="85" stroke={color} strokeWidth="2" />

      {/* Curved Longitudinal Ellipses */}
      <ellipse cx="100" cy="85" rx="28" ry="46" stroke={color} strokeWidth="1.75" fill="none" />
      <ellipse cx="100" cy="85" rx="14" ry="46" stroke={color} strokeWidth="1.5" fill="none" />

      {/* Curved Latitudinal Parallels */}
      <path d="M 60 65 Q 100 75 140 65" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M 60 105 Q 100 95 140 105" stroke={color} strokeWidth="1.5" fill="none" />

      {/* Center "MUSF" White Shield / Banner with Bold Blue Text */}
      <rect x="64" y="74" width="72" height="22" rx="4" fill="#FFFFFF" stroke={color} strokeWidth="2" />
      <text
        x="100"
        y="90"
        textAnchor="middle"
        fill={color}
        fontFamily="'Times New Roman', Georgia, serif"
        fontWeight="900"
        fontSize="16"
        letterSpacing="2.5"
      >
        MUSF
      </text>

      {/* Open Book at the Base */}
      {/* Left Page */}
      <path
        d="M 100 138 C 75 130 50 134 40 144 C 40 156 40 162 40 168 C 52 158 78 154 100 162 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Left Page Layering Lines */}
      <path d="M 46 148 C 65 140 85 142 98 147" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 45 154 C 65 146 85 148 98 153" stroke={color} strokeWidth="1.2" fill="none" />

      {/* Right Page */}
      <path
        d="M 100 138 C 125 130 150 134 160 144 C 160 156 160 162 160 168 C 148 158 122 154 100 162 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right Page Layering Lines */}
      <path d="M 154 148 C 135 140 115 142 102 147" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M 155 154 C 135 146 115 148 102 153" stroke={color} strokeWidth="1.2" fill="none" />

      {/* Book Center Binding & Pen Nib */}
      <path d="M 100 130 L 104 140 L 100 164 L 96 140 Z" fill={color} />
      <circle cx="100" cy="133" r="1.5" fill="#FFFFFF" />

      {/* Bottom Laurel Leaf Wreath Flanking Both Sides */}
      {/* Left Laurel Leaves */}
      <path d="M 40 135 Q 26 100 36 65" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="31" cy="74" rx="6" ry="3" transform="rotate(-35 31 74)" fill={color} />
      <ellipse cx="27" cy="90" rx="6.5" ry="3" transform="rotate(-15 27 90)" fill={color} />
      <ellipse cx="29" cy="107" rx="6.5" ry="3" transform="rotate(15 29 107)" fill={color} />
      <ellipse cx="36" cy="122" rx="6" ry="3" transform="rotate(35 36 122)" fill={color} />

      {/* Right Laurel Leaves */}
      <path d="M 160 135 Q 174 100 164 65" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="169" cy="74" rx="6" ry="3" transform="rotate(35 169 74)" fill={color} />
      <ellipse cx="173" cy="90" rx="6.5" ry="3" transform="rotate(15 173 90)" fill={color} />
      <ellipse cx="171" cy="107" rx="6.5" ry="3" transform="rotate(-15 171 107)" fill={color} />
      <ellipse cx="164" cy="122" rx="6" ry="3" transform="rotate(-35 164 122)" fill={color} />

      {/* Base Ribbon / Foundation Band */}
      <path
        d="M 32 173 Q 100 186 168 173 L 164 182 Q 100 194 36 182 Z"
        fill={color}
      />
    </svg>
  );
};
