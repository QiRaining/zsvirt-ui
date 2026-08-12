import { exec } from './common'

export async function restart(name: string) {
  await exec(`sudo systemctl restart '${name}'`)
}

export async function reload(name: string) {
  await exec(`sudo systemctl reload '${name}'`)
}
