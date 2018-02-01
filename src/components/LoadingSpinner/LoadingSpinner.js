import theme from './LoadingSpinner.scss'

const LoadingSpinner = () => {
  return (
    <div className={theme.spinner}>
      <div className={theme.first} />
      <div className={theme.second} />
    </div>
  )
}

export default LoadingSpinner
