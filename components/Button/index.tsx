'use client'
import { FC } from 'react'
import { tv } from 'tailwind-variants'

const button = tv({
  base: 'rounded px-4 py-2 font-semibold transition cursor-pointer whitespace-nowrap',
  variants: {
    color: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    },
  },
})

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  ...props
}) => (
  <button className={button({ color: variant, className })} {...props}>
    {children}
  </button>
)

export default Button
