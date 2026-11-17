import { SvgIcon } from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';

/** Kid-friendly cricket: rounded body, long antennae, and jumping legs. */
export default function CricketIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round">
        {/* antennae */}
        <path d="M14.5 6.5C16 4 18.5 2.5 21 2" />
        <path d="M14.5 7.5C17 6 19.5 5.5 22 5.5" />
        {/* body */}
        <ellipse cx="11" cy="12.5" rx="5.5" ry="3.5" fill="#66BB6A" />
        {/* head */}
        <circle cx="15.5" cy="9.5" r="2.2" fill="#66BB6A" />
        {/* legs */}
        <path d="M8 15.5L5.5 20.5" />
        <path d="M11 16L10 21" />
        <path d="M13.5 15L16 20" />
      </g>
      <circle cx="16.2" cy="9" r="0.9" fill="#2E7D32" />
    </SvgIcon>
  );
}
