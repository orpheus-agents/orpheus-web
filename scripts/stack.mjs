import { execFileSync, spawn } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { get as httpsGet } from 'node:https'
import { localSnapshot, validateSnapshot } from './api.mjs'

const action = process.argv[2]
if (!['start', 'stop', 'test'].includes(action)) throw new Error('Expected start, stop, or test')
const lock = JSON.parse(await readFile('api/upstream.lock.json', 'utf8'))
validateSnapshot(lock, await readFile('api/upstream.yaml'))
const environment = {
  ...process.env,
  ORPHEUS_CORE_COMMIT: lock.commit,
  ORPHEUS_CORE_CONTEXT: `${lock.repository}.git#${lock.commit}`,
}
let localContext
const project = action === 'test' ? 'orpheus-web-integration' : 'orpheus-web-dev'
const compose = ['compose', '-p', project, '-f', '.docker/dev/compose.yaml']
const saml = [...compose, '-f', '.docker/dev/compose.saml.yaml']
async function run(command, args, extraEnv = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: { ...environment, ...extraEnv } })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`))))
  })
}
function descriptor(ca) {
  return new Promise((resolve, reject) => {
    const request = httpsGet(
      'https://localhost:18444/realms/orpheus-web/protocol/saml/descriptor',
      { ca, timeout: 2000 },
      (response) => {
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () =>
          response.statusCode === 200 ? resolve(Buffer.concat(chunks)) : reject(new Error('Keycloak not ready')),
        )
      },
    )
    request.on('timeout', () => request.destroy(new Error('Keycloak timeout')))
    request.on('error', reject)
  })
}
async function setupSAML() {
  await mkdir('.integration-auth', { recursive: true })
  await run('openssl', [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    '.integration-auth/key.pem',
    '-out',
    '.integration-auth/cert.pem',
    '-subj',
    '/CN=localhost',
    '-days',
    '2',
    '-addext',
    'subjectAltName=DNS:localhost,IP:127.0.0.1',
  ])
  // Disposable fixture credentials must be readable by the containers' non-root users.
  await chmod('.integration-auth/key.pem', 0o644)
  const cert = await readFile('.integration-auth/cert.pem', 'utf8')
  const certificate = cert.replace(/-----[^-]+-----|\s/g, '')
  const realm = {
    realm: 'orpheus-web',
    enabled: true,
    sslRequired: 'all',
    clients: [
      {
        clientId: 'orpheus-web-test',
        enabled: true,
        protocol: 'saml',
        redirectUris: ['https://localhost:18443/auth/callback'],
        attributes: {
          'saml.assertion.signature': 'true',
          'saml.authnstatement': 'true',
          'saml.server.signature': 'true',
          'saml.client.signature': 'true',
          'saml.signature.algorithm': 'RSA_SHA256',
          'saml.signing.certificate': certificate,
          'saml.force.post.binding': 'true',
          saml_assertion_consumer_url_post: 'https://localhost:18443/auth/callback',
          saml_name_id_format: 'username',
        },
      },
    ],
    users: [
      {
        username: 'operator',
        firstName: 'Test',
        lastName: 'Operator',
        email: 'operator@example.test',
        emailVerified: true,
        enabled: true,
        credentials: [{ type: 'password', value: 'fixture-password', temporary: false }],
      },
    ],
  }
  await writeFile('.integration-auth/realm.json', JSON.stringify(realm))
  await run('docker', [...saml, 'up', '-d', 'keycloak'])
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      await writeFile('.integration-auth/idp.xml', await descriptor(cert))
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  throw new Error('Keycloak did not become ready')
}

try {
  if (process.env.ORPHEUS_CORE_PATH && action !== 'stop') {
    const source = resolve(process.env.ORPHEUS_CORE_PATH)
    localSnapshot(source, lock.commit) // Verify the pinned Git objects exist, independently of HEAD or working-tree edits.
    localContext = await mkdtemp(join(tmpdir(), 'orpheus-web-core-'))
    const archive = join(localContext, 'source.tar')
    execFileSync('git', ['-C', source, 'archive', '--output', archive, lock.commit])
    execFileSync('tar', ['-xf', archive, '-C', localContext])
    await rm(archive)
    environment.ORPHEUS_CORE_CONTEXT = localContext
  }
  if (action === 'stop') await run('docker', [...compose, 'down', '--remove-orphans'])
  else if (action === 'start') {
    await run('docker', [...compose, 'up', '-d', '--build', '--wait', '--wait-timeout', '180'])
    console.log('Orpheus Web: http://127.0.0.1:18085 (disposable local database, no worker)')
  } else {
    try {
      await run('docker', [...compose, 'up', '-d', '--build', '--wait', '--wait-timeout', '180'])
      await run('npx', ['playwright', 'test', 'e2e/backend.spec.ts'], { INTEGRATION_URL: 'http://127.0.0.1:18085' })
      await setupSAML()
      await run('docker', [...saml, 'up', '-d', '--wait', '--wait-timeout', '180', 'core', 'ui'])
      await run('npx', ['playwright', 'test', 'e2e/backend.spec.ts'], {
        INTEGRATION_URL: 'https://localhost:18443',
        INTEGRATION_SAML: '1',
      })
    } catch (error) {
      await run('docker', [...saml, 'logs', '--no-color', '--tail', '60']).catch(() => {})
      throw error
    } finally {
      await run('docker', [...saml, 'down', '--remove-orphans'])
    }
  }
} finally {
  if (localContext) await rm(localContext, { recursive: true })
}
