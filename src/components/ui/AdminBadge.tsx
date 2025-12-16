import React from 'react';

interface AdminBadgeProps {
  size?: number;
  className?: string;
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Admin"
    >
      {/* Shield base */}
      <path
        d="M12 2L4 6V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V6L12 2Z"
        fill="#FFEB3B"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Star symbol */}
      <path
        d="M12 8L13.09 10.26L15.5 10.62L13.75 12.33L14.18 14.73L12 13.58L9.82 14.73L10.25 12.33L8.5 10.62L10.91 10.26L12 8Z"
        fill="#000000"
        stroke="#000000"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
