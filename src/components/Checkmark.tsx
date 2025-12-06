
type Props = {
  size?: number;
  className?: string;
};

export function Checkmark({ size = 80, className = '' }: Props) {
  return (
    <div className="checkmark-container" style={{ width: size, height: size }}>
      <svg
        className={`checkmark ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
      >
        <circle
          className="checkmark__circle"
          cx="26"
          cy="26"
          r="25"
          fill="none"
        />
        <path
          className="checkmark__check"
          fill="none"
          d="M14 27l7 7 16-16"
        />
      </svg>
    </div>
  );
}

export default Checkmark;
