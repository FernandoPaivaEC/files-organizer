import { stdout } from 'process'

export default {
  error: (err: Error) => {
    stdout.write(`\nERROR > ${err}\n`)
  },
  info: (info: string) => {
    stdout.write(`\nINFO > ${info}\n`)
  }
}
