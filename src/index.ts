interface UserInfo {
  id: string
  username: string|null
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

  attachRegistration = async (token: string, user: UserInfo): Promise<WrappedResponse<CredentialEntity>> => {
    return await this.post('/credential/create', { token, user })
  }

  verifyAuthToken = async (token: string): Promise<WrappedResponse<AuthResponse>> => {
    return await this.post('/auth/verify', { token })
  }

  /**
   * @deprecated - use verifyAuthToken instead
   */
  signIn = async (token: string): Promise<WrappedResponse<AuthResponse>> => {
    return await this.verifyAuthToken(token)
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
      const data = await response.json()
      return {
        ok: response.ok,
        ...data,
      }
    } catch (error) {
      return {
        ok: false,
        result: null,
        errors: [
          { code: 'network_error', message: 'A network error occurred' },
        ]
      }
    }
  }
}

type WrappedResponse<T> =
  | { ok: true, result: T, errors: SnapAuthError[] }
  | { ok: false, result: null, errors: SnapAuthError[] }



interface CredentialEntity {
  id: string
}
interface UserEntity {
  id: string
}

interface AuthResponse {
  user: UserEntity
}

interface SnapAuthError {
  code: string
  message: string
}

export default SnapAuth
