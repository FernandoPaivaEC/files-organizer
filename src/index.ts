import { statSync, mkdirSync, readdirSync, PathLike, renameSync } from 'fs'

import { log } from '@shared'
import { FilesList, SortByOptions } from '@types'

const getFilesList = (path: PathLike): FilesList | null => {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name)
      .filter(fileName => !(fileName.split('')[0] === '.'))
      .map(fileName => ({
        name: fileName,
        path: `${path}/${fileName}`,
        createdAt: statSync(`${path}/${fileName}`).mtime
      }))
  } catch (err: any) {
    log.error(err)
    return null
  }
}

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const createFolders = (path: PathLike, filesList: FilesList, sortBy: SortByOptions) => {
  const dates = Array.from(
    filesList.map(file => ({
      day: `${file.createdAt.getDate()}`,
      month: `${file.createdAt.getMonth() + 1}`,
      year: `${file.createdAt.getFullYear()}`
    }))
  )

  const errors = []

  dates.forEach(date => {
    try {
      let dirPath = ''

      if (sortBy === 'year') {
        dirPath = `${path}/${date.year}`
      } else if (sortBy === 'month') {
        dirPath = `${path}/${date.year}/${months[Number(date.month) - 1]}`
      } else if (sortBy === 'day') {
        dirPath = `${path}/${date.year}/${months[Number(date.month) - 1]}/${date.day}`
      }

      mkdirSync(dirPath, {
        recursive: true
      })
    } catch (err: any) {
      log.error(err)
      errors.push(err)
    }
  })

  if (errors.length) {
    return false
  } else {
    return true
  }
}

const moveFiles = (path: PathLike, filesList: FilesList, sortBy: SortByOptions) => {
  const errors = []
  
  filesList.forEach(file => {
    const year = file.createdAt.getFullYear()
    const month = months[file.createdAt.getMonth()]
    const day = file.createdAt.getDate()

    try {
      let dirPath = ''

      if (sortBy === 'year') {
        dirPath = `${path}/${year}/${file.name}`
      } else if (sortBy === 'month') {
        dirPath = `${path}/${year}/${month}/${file.name}`
      } else if (sortBy === 'day') {
        dirPath = `${path}/${year}/${month}/${day}/${file.name}`
      }

      renameSync(
        file.path,
        dirPath
      )

    } catch (err: any) {
      log.error(err)
      errors.push(err)
    }
  })

  if (errors.length) {
    return false
  } else {
    return true
  }
}

const main = (path: PathLike, sortBy: SortByOptions) => {
  log.info('Listando arquivos')

  const filesList = getFilesList(path)

  if (filesList) {
    log.info('Criando pastas')

    if (createFolders(path, filesList, sortBy)) {
      log.info('Movendo arquivos')

      if (moveFiles(path, filesList, sortBy)) {
        log.info('Arquivos organizados')
      } else {
        log.error(new Error('Ocorreu um erro'))
      }
    }
  }
}

const run = () => {
  const path = process.argv[2]
  const sortBy = process.argv[3]

  if (['year', 'month', 'day'].includes(sortBy)) {
    console.clear()
    main(path, sortBy as SortByOptions)
  } else {
    console.clear()
    main(path, 'month')
  }
}

run()