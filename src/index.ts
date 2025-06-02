import { IFrappeInstance } from './types';
export * from "./lib/provider/FrappeProvider"
export * from "./hooks/useDocuments"
export * from "./hooks/useDocument"
export * from "./hooks/useAuth"

export class FrappeClient {
  private tokenProvided: boolean = false
  private baseUrl: string | null = null
  private static instance: FrappeClient;
  private initialized: boolean = false;
  private updatedTimeStamp = Date.now()
  private static options: IFrappeInstance = { baseURL: "", token: "" };
  constructor(options: IFrappeInstance) {
    if (options.token) {
      this.tokenProvided = true
    }
    this.baseUrl = options.baseURL.replace(/\/$/, '')
    // this.axiosInstance = axios.create({
    //   baseURL: options.baseURL.replace(/\/$/, ''),
    //   withCredentials: true,
    //   headers: {
    //     ...(options.token && { Authorization: `token ${options.token}` }),
    //   },
    // })
    this.initialized = true
    FrappeClient.options.baseURL = options.baseURL
    FrappeClient.options.token = options.token
  }

  public static getInstance(options?: IFrappeInstance): FrappeClient {
    if (!FrappeClient.instance) {
      if (options == undefined) {
        if (FrappeClient.options.baseURL !== '') {
          if (FrappeClient.options.baseURL == "") {
            throw new Error("Server URL not provided")
          }
        }
      } else {
        if (options.baseURL !== '') {
          if (options.baseURL == "") {
            throw new Error("Server URL not provided")
          }
        }
      }
      FrappeClient.instance = new FrappeClient({ baseURL: FrappeClient.options.baseURL, token: FrappeClient.options.token })
    }
    return FrappeClient.instance
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getInitialized() {
    return this.initialized
  }

  setUpdated() {
    console.log(this.updatedTimeStamp, "up")
    this.updatedTimeStamp = Date.now()
    console.log(this.updatedTimeStamp, "up down")
  }
  getUpdated() {
    return this.updatedTimeStamp

  }





}

export function getInstanceManager(): FrappeClient {
  return FrappeClient.getInstance()
}

export function getUtils(): { initialized: number, setUpdate: () => void, baseUrl: string | null } {
  const client = FrappeClient.getInstance()
  const initialized = client.getUpdated()
  const baseUrl = client?.getBaseUrl()
  return {
    initialized, setUpdate: client?.setUpdated?.bind(client), baseUrl
  }
}
