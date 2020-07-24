export const isNotFound = (err: any): boolean => {
  if (!err) return false

  return (
    err.notFound ||
    err.type === 'NotFoundError' ||
    /not\s*found/i.test(err.message)
  )
}