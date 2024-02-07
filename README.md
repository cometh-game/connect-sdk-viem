# Connect Viem SDK

Cometh Connect Viem SDK allows developers to onboard their users with a seedless, gasless experience familiar to Web2 using Biometrics and web2 logins.

Account Abstraction (AA) improves transaction user experience by using smart contract wallets as primary accounts.

If you need more information on how to use the SDK check our [documentation](https://docs.cometh.io/connect/cometh-connect/what-is-connect)

## Before interacting with viem

Before being able to use the connect custom viem client, we'll need to create a connect instance and call the connect function:

To get an API key please [Contact us](https://www.cometh.io/)

### Create a Wallet

```javascript
import {
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks
} from '@cometh/connect-sdk'

const walletAdaptor = new ConnectAdaptor({
  chainId: SupportedNetworks.POLYGON,
  apiKey: API_KEY
})

const wallet = new ComethWallet({
  authAdapter: walletAdaptor,
  apiKey: API_KEY,
  rpcUrl: RPC_URL
})

await wallet.connect()
```

This function create a new wallet and connect to the API.

### Connect an existing Wallet

You can also connect to a previously created wallet. You'll have to provide the wallet address of the previously created wallet.

```javascript
await wallet.connect(walletAddress)
```

## Instanciate a Connect viem Client

After creating (or reconnecting) to a connect wallet, you can now create a connectViemClient:

```javascript
import {
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks
} from '@cometh/connect-sdk'
import { getConnectViemClient } from '@cometh/connect-sdk-viem'

const walletAdaptor = new ConnectAdaptor({
  chainId: SupportedNetworks.POLYGON,
  apiKey: API_KEY
})

const wallet = new ComethWallet({
  authAdapter: walletAdaptor,
  apiKey: API_KEY,
  rpcUrl: RPC_URL
})

await wallet.connect()

const connectViemClient = getConnectViemClient({ wallet })
```

## Available Client methods

All Public actions available through a Public Viem Client are available. (see [viem docs](https://viem.sh/docs/actions/public/introduction.html))

On top of that, we added 2 custom functions that you can call throught the connectViemClient:

- sendTransaction
- getTransaction

### Send transaction

```javascript
import { encodeFunctionData } from 'viem'

const txCallData = encodeFunctionData({
  abi: CONTRACT_ABI,
  functionName: CONTRACT_METHOD
})

const tx = { to: DESTINATION, value: VALUE, data: txCallData }
const txHash = await connectViemClient.sendTransaction(tx)
```

This function relays the transaction data to the target address. The transaction fees can be sponsored.

### Send Batch transactions

```javascript
const txBatch = [
  { to: DESTINATION, value: VALUE, data: txCallData },
  { to: DESTINATION, value: VALUE, data: txCallData }
]
const txHash = await connectViemClient.sendBatchTransactions(tx)
```

This function relays a batch of transaction data to the targeted addresses. The transaction fees can be sponsored as well.

### Verify Message

```javascript
const signature = await connectViemClient.verifyMessage({
  message: 'hello',
  address,
  signature
})
```

Verify the given signature and message signed by the the smart wallet.

## Instanciate a Connect Viem Account

```javascript
import {
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks
} from '@cometh/connect-sdk'
import { getConnectViemAccount } from '@cometh/connect-sdk-viem'

const walletAdaptor = new ConnectAdaptor({
  chainId: SupportedNetworks.POLYGON,
  apiKey: API_KEY
})

const wallet = new ComethWallet({
  authAdapter: walletAdaptor,
  apiKey: API_KEY,
  rpcUrl: RPC_URL
})

await wallet.connect()

const connectViemAccount = getConnectViemAccount(wallet)
```

## Available Account methods

### Sign Message

```javascript
const signature = await connectViemAccount.signMessage({ message: 'hello' })
```

Sign the given message using the EOA, owner of the smart wallet.

### Sign Transaction

```javascript
const tx = { to: DESTINATION, value: VALUE, data: txCallData }

const signature = await connectViemAccount.signTransaction(tx)
```

Sign the given message using the EOA, owner of the smart wallet.
