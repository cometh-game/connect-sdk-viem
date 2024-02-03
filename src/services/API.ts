import { API_URL } from '@cometh/connect-sdk'
import axios, { AxiosInstance } from 'axios'

export const getConnectApi = (apiKey: string): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL
  })
  api.defaults.headers.common['apikey'] = apiKey

  return api
}
