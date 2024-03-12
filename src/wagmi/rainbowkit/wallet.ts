import { Wallet } from '@rainbow-me/rainbowkit'

import { ComethConnectorOptions, getComethConnectConnector } from '../connector'

export const comethConnectWallet = (
  options: ComethConnectorOptions
): Wallet => ({
  id: 'cometh-connect',
  name: 'Cometh Connect',
  iconUrl:
    'https://pbs.twimg.com/profile_images/1679433363818442753/E2kNVLBe_400x400.jpg',
  iconBackground: '#0c2f78',
  createConnector: getComethConnectConnector(options)
})
