import React from "react";
import type { SVGProps } from "react";
const SvgDropDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={17}
    fill="none"
    {...props}
  >
    <path
      stroke="#111021"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m4 6.043 4 4 4-4"
    />
  </svg>
);
export default SvgDropDown;
