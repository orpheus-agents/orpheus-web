import { createServer } from 'node:http'

// The disposable stack only verifies aliases and tags. It never creates a sandbox.
createServer((request, response) => {
  const reply = (status, body) => {
    response.writeHead(status, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(body))
  }
  if (request.method !== 'GET') return reply(405, {})
  if (request.url === '/health') return reply(200, {})
  if (request.headers['x-api-key'] !== 'fixture-agentbox-key') return reply(401, {})
  if (['/templates/aliases/codex', '/templates/aliases/team%2Fcodex'].includes(request.url)) {
    return reply(200, { templateID: 'fixture-codex' })
  }
  if (request.url === '/templates/fixture-codex/tags') return reply(200, [{ tag: 'default' }, { tag: 'v1' }])
  return reply(404, {})
}).listen(8090, '0.0.0.0')
