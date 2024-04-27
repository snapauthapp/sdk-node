interface UserInfo {
  id: string
  handle: string|null
}
interface Options {
  host?: URL
}

declare var VERSION: string
class SnapAuth {

  private authHeader: string
  private host: URL

  constructor(secretKey: string|undefined = undefined, options: Options = {}) {
    secretKey = secretKey || process.env.SNAPAUTH_SECRET_KEY
    if (secretKey === undefined) {
        throw new ErrorEvent('SnapAuth secret key not provided. Set it explicitly or through the SNAPAUTH_SECRET_KEY environment variable.')
    }
    this.authHeader = 'Basic ' + btoa(':' + secretKey)
    this.host = options.host || new URL('https://api.snapauth.app')
    if (!this.host.hostname.length) {
      throw new Error('Invalid SnapAuth host')
    }
  }

  attachRegistration = async (token: string, user: UserInfo): Promise<WrappedResponse<RegistrationResponse>> => {
    return await this.post('/registration/attach', { token, user })
  }

  signIn = async (token: string): Promise<WrappedResponse<AuthResponse>> => {
    return await this.post('/auth/verify', { token })
  }


  private post = async (path: string, body: any): Promise<WrappedResponse<any>> => {
    try {
      const response = await fetch(new URL(path, this.host), {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
          'Content-type': 'application/json',
          'User-agent': `node-sdk/${VERSION} node/${process.version}`,
          'X-SDK': `node/${VERSION}`,
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const data = await response.json()
        console.debug(data)
        // FIXME: tighten this a lot
        return { ok: true, result: data.result, errors: data.errors ?? [] }
      } else {
        throw new Error('nooope')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.stack)
      }
      return {
        ok: false,
        errors: [
          { code: 'uhoh', message: 'it bad' },
        ]
      }
    }
  }

}

interface AuthResponse {
  user: {
    id: string
    handle: string|null
  }
}
interface RegistrationResponse {
  id: string
}
type WrappedResponse<T> =
  | { ok: true, result: T, errors: SAError[] }
  | { ok: false, errors: SAError[] }

interface SAError {
  code: string
  message: string
}

export default SnapAuth
