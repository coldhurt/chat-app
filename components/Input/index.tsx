import React, { FC, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input: FC<InputProps> = ({ label = '', ...props }) => (
  <div>
    {label && (
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
    )}
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:ring-1 focus:outline-none dark:bg-gray-700 dark:text-white"
    />
  </div>
)

export default Input
