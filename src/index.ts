import { statSync, mkdirSync, readdirSync, PathLike, renameSync } from 'fs'

import { log } from '@shared'
import { filesList } from '@types'

const getFilesList = (path: PathLike): filesList | null => {
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

const createFolders = (path: PathLike, filesList: filesList) => {
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
      mkdirSync(
        `${path}/${date.year}/${months[Number(date.month) - 1]}/${date.day}`,
        {
          recursive: true
        }
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

const moveFiles = (path: PathLike, filesList: filesList) => {
  const errors = []
  
  filesList.forEach(file => {
    const year = file.createdAt.getFullYear()
    const month = months[file.createdAt.getMonth()]
    const day = file.createdAt.getDate()

    try {
      renameSync(
        file.path,
        `${path}/${year}/${month}/${day}/${file.name}`
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

const main = (path: PathLike) => {
  log.info('Listando arquivos')

  const filesList = getFilesList(path)

  if (filesList) {
    log.info('Criando pastas')

    if (createFolders(path, filesList)) {
      log.info('Movendo arquivos')

      if (moveFiles(path, filesList)) {
        log.info('Arquivos organizados')
      } else {
        log.error(new Error('Ocorreu um erro'))
      }
    }
  }
}

const run = () => {
  const path = process.argv[2]
  console.clear()
  main(path)
}

run()