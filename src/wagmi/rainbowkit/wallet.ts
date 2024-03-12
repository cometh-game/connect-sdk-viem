import { Wallet } from '@rainbow-me/rainbowkit'
import { CreateWalletFn } from '@rainbow-me/rainbowkit/dist/wallets/Wallet'

import { ComethConnectorOptions, getComethConnectConnector } from '../connector'

export const getComethConnectWallet = (
  options: ComethConnectorOptions
): CreateWalletFn => {
  return () => comethConnectWallet(options)
}

export const comethConnectWallet = (
  options: ComethConnectorOptions
): Wallet => ({
  id: 'cometh',
  name: 'Cometh Connect',
  iconUrl:
    'https://pbs.twimg.com/profile_images/1679433363818442753/E2kNVLBe_400x400.jpg',
  iconBackground: '#ffffff',
  installed: true,
  createConnector: getComethConnectConnector(options)
})
