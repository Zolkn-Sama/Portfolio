import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const FILE = resolve(import.meta.dirname, 'public/leaderboard.json')
const MAX = 10

/**
 * En développement uniquement : `POST /__leaderboard` ajoute un score à
 * `public/leaderboard.json`. C'est la façon de remplir le tableau de référence
 * — on joue en local, puis on versionne le fichier. Aucune route équivalente
 * n'existe en production, où le fichier est servi en lecture seule.
 */
function leaderboardWriter(): Plugin {
  return {
    name: 'leaderboard-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__leaderboard', (req, res, next) => {
        if (req.method !== 'POST') return next()

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
          if (body.length > 4096) req.destroy()
        })
        req.on('end', () => {
          try {
            const { game, entry } = JSON.parse(body)
            if (
              typeof game !== 'string' ||
              !/^[a-z]+$/.test(game) ||
              typeof entry?.name !== 'string' ||
              typeof entry?.score !== 'number' ||
              !Number.isFinite(entry.score)
            ) {
              res.statusCode = 400
              return res.end('invalid')
            }

            const board = JSON.parse(readFileSync(FILE, 'utf8'))
            board[game] = [
              ...(Array.isArray(board[game]) ? board[game] : []),
              {
                name: String(entry.name).slice(0, 3).toUpperCase(),
                score: Math.round(entry.score),
                detail: String(entry.detail ?? '').slice(0, 32),
                at: Number(entry.at) || Date.now(),
              },
            ]
              .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
              .slice(0, MAX)

            writeFileSync(FILE, `${JSON.stringify(board, null, 2)}\n`)
            res.statusCode = 204
            res.end()
          } catch {
            res.statusCode = 500
            res.end('error')
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), leaderboardWriter()],
})
