import { Chain, Wallet } from '@rainbow-me/rainbowkit'

import { ComethConnectConnector } from '../connector'

export interface RainbowKitConnectorParams {
  apiKey: string
  chain: Chain
  baseUrl?: string
}

export const rainbowComethConnect = ({
  apiKey,
  chain,
  baseUrl
}: RainbowKitConnectorParams): Wallet => ({
  id: 'cometh-connect',
  name: 'Cometh Connect',
  iconUrl:
    'https://pbs.twimg.com/profile_images/1679433363818442753/E2kNVLBe_400x400.jpg',
  iconBackground: '#ffffff',
  /* eslint-disable */
  createConnector: () => {
    return {
      connector: new ComethConnectConnector({ apiKey, chain, baseUrl })
    }
  }
})
