import { UIConfig, webAuthnOptions } from '@cometh/connect-sdk'
import { Chain, Wallet } from '@rainbow-me/rainbowkit'

import { ComethConnectConnector } from '../connector'

export interface RainbowKitConnectorParams {
  apiKey: string
  chains: Chain[]
  walletAddress?: string
  disableEoaFallback?: boolean
  encryptionSalt?: string
  webAuthnOptions?: webAuthnOptions
  passKeyName?: string
  uiConfig?: UIConfig
  baseUrl?: string
  rpcUrl?: string
}

export const rainbowkitComethConnect = ({
  apiKey,
  chains,
  walletAddress,
  disableEoaFallback,
  encryptionSalt,
  webAuthnOptions,
  passKeyName,
  uiConfig,
  baseUrl,
  rpcUrl
}: RainbowKitConnectorParams): Wallet => ({
  id: 'cometh-connect',
  name: 'Cometh Connect',
  iconUrl:
    'https://pbs.twimg.com/profile_images/1679433363818442753/E2kNVLBe_400x400.jpg',
  iconBackground: '#ffffff',
  /* eslint-disable */
  createConnector: () => {
    return {
      connector: new ComethConnectConnector({
        chains,
        options: {
          apiKey,
          walletAddress,
          disableEoaFallback,
          encryptionSalt,
          webAuthnOptions,
          passKeyName,
          uiConfig,
          rpcUrl,
          baseUrl
        }
      })
    }
  }
})
