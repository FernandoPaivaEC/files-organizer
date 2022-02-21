import { PathLike } from 'fs'

type FilesList = {
  name: string
  path: PathLike
  createdAt: Date
}[]

type SortByOptions = 'year' | 'month' | 'day'

export {
  FilesList,
  SortByOptions
}
