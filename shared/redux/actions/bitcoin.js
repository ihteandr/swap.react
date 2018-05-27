import BigInteger from 'bigi'
import { request } from 'helpers'
import bitcoin from 'bitcoinjs-lib'
import reducers from 'redux/core/reducers'
import config from 'app-config'


const login = (privateKey) => {
  let keyPair

  if (privateKey) {
    const hash  = bitcoin.crypto.sha256(privateKey)
    const d     = BigInteger.fromBuffer(hash)

    keyPair     = new bitcoin.ECPair(d, null, { network: bitcoin.networks.testnet })
  }
  else {
    console.info('Created account Bitcoin ...')
    keyPair     = bitcoin.ECPair.makeRandom({ network: bitcoin.networks.testnet })
    privateKey  = keyPair.toWIF()
  }

  const address     = keyPair.getAddress()
  const account     = new bitcoin.ECPair.fromWIF(privateKey, bitcoin.networks.testnet) // eslint-disable-line
  const publicKey   = account.getPublicKeyBuffer().toString('hex')

  const data = {
    account,
    keyPair,
    address,
    privateKey,
    publicKey,
  }

  console.info('Logged in with Bitcoin', data)
  reducers.user.setAuthData({ name: 'btcData', data })
}

const getBalance = (address) =>
  request.get(`${config.api.bitpay}/addr/${address}`)
    .then(({ balance: amount }) => {
      console.log('BTC Balance:', amount)
      reducers.user.setBalance({ name: 'btcData', amount })
    })

const getTransaction = (address) =>
  new Promise((resolve) => {

    const url = `${config.api.blocktrail}/address/${address}/transactions?api_key=${config.apiKeys.blocktrail}`
    let transactions

    request.get(url).then((res) => {
      if (res.total) {
        transactions = res.data.map((item) => ({
          type: 'btc',
          status: item.block_hash != null ? 1 : 0,
          value: item.outputs[0].value / 1e8,
          address: item.outputs[0].address,
          date: new Date(Date.parse(item.time)).getTime(),
          direction: address.toLocaleLowerCase() === item.outputs[0].address.toLocaleLowerCase() ? 'in' : 'out',
        }))
        resolve(transactions)
      }
      else {
        console.error('res:status BTC false', res)
      }
    })
  })

const send = (from, to, amount, keyPair) =>
  new Promise((resolve, reject) => {
    const newtx = {
      inputs: [
        {
          addresses: [ from ],
        },
      ],
      outputs: [
        {
          addresses: [ to ],
          value: amount * 100000000,
        },
      ],
    }
    request.post('https://api.blockcypher.com/v1/btc/test3/txs/new', {
      body: JSON.stringify(newtx),
    })
      .then((d) => {
        const tmptx = {
          ...d,
          pubkeys: [],
        }

        const keys = new bitcoin.ECPair.fromWIF(keyPair.toWIF(), bitcoin.networks.testnet) // eslint-disable-line

        tmptx.signatures = tmptx.tosign.map((toSign) => {
          tmptx.pubkeys.push(keys.getPublicKeyBuffer().toString('hex'))

          return keys.sign(BigInteger.fromHex(toSign.toString('hex')).toBuffer()).toDER().toString('hex')
        })

        return request.post('https://api.blockcypher.com/v1/btc/test3/txs/send', {
          body: JSON.stringify(tmptx),
        })
      })
      .then((res) => resolve(res)).catch((e) => console.log(e))
  })

const fetchUnspents = (address) =>
  request.get(`${config.api.bitpay}/addr/${address}/utxo`)

const broadcastTx = (txRaw) =>
  request.post(`${config.api.bitpay}/tx/send`, {
    body: {
      rawtx: txRaw,
    },
  })


export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchUnspents,
  broadcastTx,
}