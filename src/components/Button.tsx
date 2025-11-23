import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'error' | 'success' | 'info' | 'warning' | 'link';
type Size = 'xs' | 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  className?: string;
};

export default function Button({ variant, size = 'md', className = '', children, ...rest }: ButtonProps) {
  const variantClass = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    ghost: 'btn btn-ghost',
    error: 'btn btn-error',
    success: 'btn btn-success',
    info: 'btn btn-info',
    warning: 'btn btn-warning',
    link: 'btn btn-link',
  }[variant as Variant] || 'btn';

  const sizeClass = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size];

  const classes = [variantClass, sizeClass, className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
