import axios from 'axios'

// @review (mainnet)
export enum UnisatNetworkType {
    livenet = 'livenet',
    testnet = 'testnet',
}

let network = UnisatNetworkType.testnet

export function setApiNetwork(type: UnisatNetworkType) {
    network = type
}

function createApi(baseURL: string) {
    const api = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const apiKey = process.env.NEXT_PUBLIC_API_UNISAT //localStorage.getItem('apiKey') || ''

    api.interceptors.request.use((config) => {
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }
        config.headers.Authorization = `Bearer ${apiKey}`
        return config
    })
    return api
}

const mainnetApi = createApi('https://open-api.unisat.io')
const testnetApi = createApi('https://open-api-testnet.unisat.io')

function getApi() {
    return network === UnisatNetworkType.testnet ? testnetApi : mainnetApi
}

export const get = async (url: string, params?: any) => {
    const res = await getApi().get(url, { params })
    if (res.status !== 200) {
        throw new Error(res.statusText)
    }

    const responseData = res.data

    if (responseData.code !== 0) {
        throw new Error(responseData.msg)
    }
    return responseData.data
}

export const post = async (url: string, data?: any) => {
    const res = await getApi().post(url, data)
    if (res.status !== 200) {
        throw new Error(res.statusText)
    }

    const responseData = res.data

    if (responseData.code !== 0) {
        throw new Error(responseData.msg)
    }

    return responseData.data
}
