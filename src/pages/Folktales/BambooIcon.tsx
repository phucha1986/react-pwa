import { SvgIcon } from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';

/** Kid-friendly bamboo: two rounded stalks with node rings and soft leaves. */
export default function BambooIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="#2E7D32" strokeWidth="2.2" strokeLinecap="round">
        <path d="M9 21.5V7" />
        <path d="M15 21.5V10" />
        <path d="M7.8 16h2.4" strokeWidth="1.4" />
        <path d="M7.8 11.5h2.4" strokeWidth="1.4" />
        <path d="M13.8 15.5h2.4" strokeWidth="1.4" />
        <path d="M13.8 12h2.4" strokeWidth="1.4" />
      </g>
      <g fill="#66BB6A">
        <path d="M9 7C6.6 6.4 4.8 4.8 4 2.6c2.6.2 4.6 1.6 5.6 3.6z" />
        <path d="M9 7c2.2-1.2 4.2-1.4 6-.6-2 .8-3.8 1.8-5 3z" />
        <path d="M15 10c2.4-1 4.4-1 6-.2-2.2.6-4 1.4-5.2 2.4z" />
      </g>
    </SvgIcon>
  );
}
