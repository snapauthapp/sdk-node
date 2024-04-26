interface UserInfo {
  id: string
  handle: string|null
}
interface Options {
  host?: URL
}

class SnapAuth {

  private secretKey: string
  private host: URL

  constructor(secretKey: string|undefined = undefined, options: Options = {}) {
    // if (secretKey === undefined) {
    //   const envSecret = process.env.SNAPAUTH_SECRET_KEY
    //   if (envSecret !== undefined
    this.secretKey = secretKey || 'FIXME'
    this.host = options.host || new URL('https://api.snapauth.app')
    // TODO: validate host
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
          Authorization: `Basic ${btoa(':' + this.secretKey)}`,
          Accept: 'application/json',
          'Content-type': 'application/json',
          // content-length?
          'User-agent': 'node-sdk/0.0.0 fetch/??? node/???',
          'X-SDK': 'node/0.0.0',
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

