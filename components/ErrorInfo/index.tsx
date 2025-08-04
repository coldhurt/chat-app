const ErrorInfo: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className='bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm border border-red-300 dark:bg-red-200'>
      {message}
    </div>
  )
}

export default ErrorInfo
