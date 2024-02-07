import {
  ComethWallet,
  ConnectAdaptor,
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

export class ComethConnectConnector extends Connector<
  undefined,
  ComethConnectorOptions
> {
  id = 'cometh-connect'
  name = 'Cometh Connect'
  ready = true
  wallet: ComethWallet
  client: ConnectClient
  walletAddress?: string

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

    const chainId = toHex(this.chains[0].id)

    if (isSupportedNetwork(chainId)) {
      this.wallet = new ComethWallet({
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

      this.client = getConnectViemClient({ wallet: this.wallet, apiKey })
      this.walletAddress = walletAddress
      this.ready = true
    } else {
      throw new Error('Network not supported')
    }
  }

  /* eslint-disable */
  async connect() {
    if (this.walletAddress) {
      await this.wallet.connect(this.walletAddress)
      window.localStorage.setItem('walletAddress', this.walletAddress)
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

    return {
      account: this.wallet.getAddress() as `0x${string}`,
      chain: {
        id: this.wallet.chainId,
        unsupported: false
      }
    }
  }
  disconnect(): Promise<void> {
    // Remove shim signalling wallet is disconnected
    if (this.options.shimDisconnect)
      this.storage?.removeItem(this.shimDisconnectKey)

    return this.wallet.logout()
  }
  async getAccount(): Promise<`0x${string}`> {
    return this.wallet.getAddress() as `0x${string}`
  }
  async getChainId(): Promise<number> {
    return await this.wallet.chainId
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
