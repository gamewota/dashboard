
type Props = {
  size?: number;
  className?: string;
};

export function Crossmark({ size = 80, className = '' }: Props) {
  return (
    <div className="checkmark-container" style={{ width: size, height: size }}>
      <svg
        className={`crossmark ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
      >
        <circle
          className="checkmark__circle error"
          cx="26"
          cy="26"
          r="25"
          fill="none"
        />
        <line
          className="checkmark__check error"
          x1="16"
          y1="16"
          x2="36"
          y2="36"
        />
        <line
          className="checkmark__check error"
          x1="36"
          y1="16"
          x2="16"
          y2="36"
        />
      </svg>
    </div>
  );
}

export default Crossmark;
