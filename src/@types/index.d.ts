import { PathLike } from 'fs'

type filesList = {
  name: string
  path: PathLike
  createdAt: Date
}[]

export {
  filesList
}
