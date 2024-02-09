import {
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks,
  UIConfig,
  webAuthnOptions
} from '@cometh/connect-sdk'
import { toHex } from 'viem'
import { Chain, Connector, ConnectorNotFoundError } from 'wagmi'

import {
  ConnectClient,
  getConnectViemClient
} from '../client/getConnectViemClient'
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

type ConnectFunctionConfig = {
  /** Target chain to connect to. */
  chainId?: number
}

export class ComethConnectConnector extends Connector<
  undefined,
  ComethConnectorOptions
> {
  id = 'cometh-connect'
  name = 'Cometh Connect'
  ready = false
  wallet?: ComethWallet
  client?: ConnectClient

  protected shimDisconnectKey = `${this.id}.shimDisconnect`

  constructor({
    chains,
    options: options_
  }: {
    chains: Chain[]
    options: WagmiConfigConnectorParams
  }) {
    const options = {
      shimDisconnect: true,
      ...options_
    }

    super({
      chains,
      options
    })

    this.ready = true
  }

  /* eslint-disable */
  async connect({ chainId }: ConnectFunctionConfig = {}) {
    const {
      apiKey,
      walletAddress,
      disableEoaFallback,
      encryptionSalt,
      webAuthnOptions,
      passKeyName,
      baseUrl,
      uiConfig,
      rpcUrl
    } = this.options

    const selectedChainId = this._getSelectedChainId(chainId)

    this.wallet = new ComethWallet({
      authAdapter: new ConnectAdaptor({
        chainId: selectedChainId,
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

    this.client = getConnectViemClient({ wallet: this.wallet, apiKey })

    if (walletAddress) {
      await this.wallet.connect(walletAddress)
      window.localStorage.setItem('walletAddress', walletAddress)
    } else {
      const localStorageAddress = window.localStorage.getItem('walletAddress')

      if (localStorageAddress) {
        await this.wallet.connect(localStorageAddress)
      } else {
        await this.wallet.connect()
        window.localStorage.setItem('walletAddress', this.wallet.getAddress())
      }
    }

    if (this.options.shimDisconnect)
      this.storage?.setItem(this.shimDisconnectKey, true)

    console.warn(`Connected to ${selectedChainId}`)

    return {
      account: this.wallet.getAddress() as `0x${string}`,
      chain: {
        id: this.wallet.chainId,
        unsupported: false
      }
    }
  }

  private _getSelectedChainId(chainId?: number) {
    if (chainId) {
      const providedChainId = toHex(chainId)

      if (!isSupportedNetwork(providedChainId))
        throw new Error('Network not supported')

      return providedChainId
    } else {
      const supportedChains = this.chains.reduce(
        (chains: SupportedNetworks[], chain: Chain) => {
          const chainId = toHex(chain.id)
          if (!isSupportedNetwork(chainId)) {
            console.warn(`${chain.name} not yet supported by cometh connect`)
          } else {
            chains.push(chainId)
          }
          return chains
        },
        []
      )
      if (supportedChains.length === 0)
        throw new Error('Cometh Connect does not support the provided chains')

      if (supportedChains.length > 1)
        console.warn(`Cometh connect does not support multichain`)

      return supportedChains[0]
    }
  }
  disconnect(): Promise<void> {
    if (!this.wallet) throw new Error('no')
    // Remove shim signalling wallet is disconnected
    if (this.options.shimDisconnect)
      this.storage?.removeItem(this.shimDisconnectKey)

    return this.wallet.logout()
  }
  async getAccount(): Promise<`0x${string}`> {
    if (!this.wallet) throw new Error('no')
    return this.wallet.getAddress() as `0x${string}`
  }
  async getChainId(): Promise<number> {
    if (!this.wallet) {
      return this.chains[0].id
    } else {
      return await this.wallet.chainId
    }
  }
  /* eslint-disable */
  async getProvider(): Promise<any> {
    return this.client
  }
  /* eslint-disable */
  async getWalletClient(): Promise<any> {
    return this.client
  }
  async isAuthorized() {
    try {
      if (
        this.options.shimDisconnect &&
        // If shim does not exist in storage, wallet is disconnected
        !this.storage?.getItem(this.shimDisconnectKey)
      )
        return false

      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      return true
    } catch {
      return false
    }
  }
  protected onAccountsChanged(): void {
    throw new Error('method is not available')
    return
  }
  protected onChainChanged(): void {
    throw new Error('method is not available')
    return
  }
  protected onDisconnect(): void {
    throw new Error('method is not available')
    return
  }
}
