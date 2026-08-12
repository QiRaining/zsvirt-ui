import { resolve } from 'node:path'

export const WORKING_DIR = resolve(process.cwd())
export const PUBLIC_DIR = resolve(WORKING_DIR, 'public')
