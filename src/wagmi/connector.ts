import {
  ComethWallet,
  ConnectAdaptor,
  UIConfig,
  webAuthnOptions
} from '@cometh/connect-sdk'
import {
  CreateConnector,
  WalletDetailsParams
} from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { createConnector, ProviderNotFoundError } from '@wagmi/core'
import {
  Address,
  Client,
  ProviderRpcError,
  toHex,
  UserRejectedRequestError
} from 'viem'
import { CreateConnectorFn } from 'wagmi'

import { ConnectClient, getConnectViemClient } from '../client'
import { isSupportedNetwork } from '../utils/utils'

export interface WagmiConfigConnectorParams {
  apiKey: string
  walletAddress?: string
  disableEoaFallback?: boolean
  encryptionSalt?: string
  webAuthnOptions?: webAuthnOptions
  passKeyName?: string
  uiConfig?: UIConfig
  baseUrl?: string
  rpcUrl?: string
}

export type ComethConnectorOptions = WagmiConfigConnectorParams & {
  /**
   *
   * This flag simulates the disconnect behavior by keeping track of connection status in storage
   * and only autoconnecting when previously connected by user action (e.g. explicitly choosing to connect).
   *
   * @default true
   */
  shimDisconnect?: boolean
}

export function getComethConnectConnector(
  options: ComethConnectorOptions
): CreateConnector {
  if (!options.apiKey || options.apiKey === '') {
    throw new Error(
      'No apikey found. Please provide an apikey to use Cometh Connect.'
    )
  }

  return (walletDetails: WalletDetailsParams): CreateConnectorFn => {
    return createComethConnectConnector(options, walletDetails)
  }
}

function createComethConnectConnector(
  options: ComethConnectorOptions,
  walletDetails: WalletDetailsParams
): CreateConnectorFn {
  return createConnector((config) => ({
    ...comethConnectConnector(options)(config),
    ...walletDetails
  }))
}

comethConnectConnector.type = 'cometh-connect' as const
export function comethConnectConnector(
  parameters: ComethConnectorOptions
): CreateConnectorFn {
  const { shimDisconnect = true } = parameters

  type Provider = ConnectClient | undefined
  type Properties = {}
  type StorageItem = {
    [_ in 'cometh-connect.connected' | `${string}.disconnected`]: true
  }

  let wallet: ComethWallet
  let client: Provider
  let walletAddress: string | undefined

  return createConnector<Provider, Properties, StorageItem>((config) => ({
    id: 'cometh-connect',
    name: 'Cometh Connect',
    type: comethConnectConnector.type,
    async setup(): Promise<void> {
      const localStorageAddress = window.localStorage.getItem('walletAddress')

      if (localStorageAddress) {
        walletAddress = localStorageAddress
        this.connect()
      }
    },
    async connect(): Promise<{
      accounts: readonly Address[]
      chainId: number
    }> {
      try {
        if (config.chains.length !== 1)
          throw new Error(
            'Cometh Connect does not support multi network in config'
          )

        const {
          apiKey,
          disableEoaFallback,
          encryptionSalt,
          webAuthnOptions,
          passKeyName,
          baseUrl,
          uiConfig,
          rpcUrl
        } = parameters

        const chainId = toHex(config.chains[0].id)

        if (isSupportedNetwork(chainId)) {
          wallet = new ComethWallet({
            authAdapter: new ConnectAdaptor({
              chainId,
              apiKey,
              disableEoaFallback,
              encryptionSalt,
              webAuthnOptions,
              passKeyName,
              rpcUrl,
              baseUrl
            }),
            apiKey,
            uiConfig,
            rpcUrl,
            baseUrl
          })

          client = getConnectViemClient({ wallet, apiKey })
          walletAddress = parameters.walletAddress
        } else {
          throw new Error('Network not supported')
        }

        if (walletAddress) {
          await wallet.connect(walletAddress)
          window.localStorage.setItem('walletAddress', walletAddress)
        } else {
          const localStorageAddress =
            window.localStorage.getItem('walletAddress')

          if (localStorageAddress) {
            await wallet.connect(localStorageAddress)
          } else {
            await wallet.connect()
            window.localStorage.setItem('walletAddress', wallet.getAddress())
          }
        }

        await config.storage?.removeItem(`${this.id}.disconnected`)

        return {
          accounts: await this.getAccounts(),
          chainId: await this.getChainId()
        }
      } catch (error) {
        if (
          /(user rejected|connection request reset)/i.test(
            (error as ProviderRpcError)?.message
          )
        ) {
          throw new UserRejectedRequestError(error as Error)
        }
        throw error
      }
    },
    disconnect(): Promise<void> {
      // Remove shim signalling wallet is disconnected
      if (shimDisconnect)
        config.storage?.setItem(`${this.id}.disconnected`, true)

      return wallet.logout()
    },
    async getAccounts(): Promise<readonly Address[]> {
      return [wallet.getAddress() as Address]
    },
    async getChainId(): Promise<number> {
      return wallet.chainId
    },
    async getProvider(): Promise<Provider> {
      return client
    },
    async getWalletClient(): Promise<Provider> {
      return client
    },
    async getClient(): Promise<Client> {
      return client as Client
    },
    async isAuthorized(): Promise<boolean> {
      try {
        const isDisconnected =
          shimDisconnect &&
          // If shim exists in storage, connector is disconnected
          (await config.storage?.getItem(`${this.id}.disconnected`))

        if (isDisconnected) return false

        if (!client) throw new ProviderNotFoundError()
        return true
      } catch {
        return false
      }
    },
    onAccountsChanged(): void {
      throw new Error('method is not available')
      return
    },
    onChainChanged(): void {
      throw new Error('method is not available')
      return
    },
    onDisconnect(): void {
      throw new Error('method is not available')
      return
    }
  }))
}
