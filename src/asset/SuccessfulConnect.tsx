export const SucessfulConnect = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 120 120"
      {...props}
    >
      <rect width="119" height="119" x=".5" y=".5" fill="#F4F6F5" rx="59.5" />
      <rect width="100" height="100" x="10" y="10" fill="#BDE3CD" rx="50" />
      <rect width="80" height="80" x="20" y="20" fill="#40B773" rx="40" />
      <mask
        id="a"
        width="32"
        height="32"
        x="44"
        y="44"
        maskUnits="userSpaceOnUse"
      >
        <path fill="#D9D9D9" d="M44 44h32v32H44z" />
      </mask>
      <g mask="url(#a)">
        <path
          fill="#fff"
          d="m56.73 69.07-8.66-8.67 3-3 5.66 5.67 12.2-12.2 3 3-15.2 15.2Z"
        />
      </g>
      <rect
        width="119"
        height="119"
        x=".5"
        y=".5"
        stroke="transparent"
        rx="59.5"
      />
    </svg>
  );
};
