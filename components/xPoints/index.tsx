import styles from './styles.module.scss'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import Image from 'next/image'
import { $user } from '../../src/store/user'
import {
    $xpointsBalance,
    updateModalTx,
    updateNewMotionsModal,
    updateXpointsBalance,
} from '../../src/store/modal'
import { $net } from '../../src/store/wallet-network'
import { fetchAddr } from '../SearchBar/utils'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import ArrowUp from '../../src/assets/logos/arrow-up.png'
import { toast } from 'react-toastify'
import { setTxId, setTxStatusLoading } from '../../src/app/actions'
import { ZilPayBase } from '../ZilPay/zilpay-base'

function Component() {
    const dispatch = useDispatch()
    const net = useStore($net)
    const xpointsBalance = useStore($xpointsBalance)
    const [hideAdd, setHideAdd] = useState(true)
    const [loading, setLoading] = useState(true)
    const [amount, setAmount] = useState(0)
    const [addLegend, setAddLegend] = useState('new motion')
    const [selectedId, setSelectedId] = useState('')
    const [motionData, setMotionData] = useState(Array())
    const loginInfo = useSelector((state: RootState) => state.modal)

    let addr = ''
    if (loginInfo.contract) {
        addr = loginInfo.contract.addr
    }

    const [xpoints_addr, setAddr] = useState(addr)

    useEffect(() => {
        fetchXpoints()
            .then(() => {
                fetchMotion().then(() => {
                    setLoading(false)
                })
                    .catch(error => { throw error })
            })
            .catch((error) => {
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchXpoints = async () => {
        if (xpoints_addr === '') {
            await fetchAddr({
                net,
                _username: 'xpoints',
                _domain: 'did',
            }).then((addr) => setAddr(addr))
        }
        updateXpointsBalance(0)
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        await fetchAddr({
            net,
            _username: 'donate',
            _domain: 'did',
        })
            .then(async (donate_addr) => {
                return await init.API.blockchain.getSmartContractSubState(
                    donate_addr,
                    'xpoints'
                )
            })
            .then(async (balances) => {
                return await tyron.SmartUtil.default.intoMap(
                    balances.result.xpoints
                )
            })
            .then((balances_) => {
                // Get balance of the logged in address
                const balance = balances_.get(
                    loginInfo.zilAddr?.base16.toLowerCase()
                )
                if (balance !== undefined) {
                    updateXpointsBalance(balance / 1e12)
                }
            })
            .catch(() => {
                setLoading(false)
                throw new Error('Donate DApp: Not able to fetch balance.')
            })
    }

    const fetchMotion = async () => {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        await init.API.blockchain
            .getSmartContractState(xpoints_addr!)
            .then(async (state_) => {
                const data = await tyron.SmartUtil.default.intoMap(
                    state_.result.motions
                )
                const data2 = await tyron.SmartUtil.default.intoMap(
                    state_.result.ranking
                )
                const motions = Array.from(data.values())
                const id = Array.from(data.keys())
                const xp = Array.from(data2.values())
                let arr: any = []

                for (let i = 0; i < motions.length; i += 1) {
                    const obj = {
                        id: id[i],
                        motion: motions[i],
                        xp: xp[i],
                    }
                    arr = [obj, ...arr]
                }

                var res = arr.sort(
                    (a: { xp: number }, b: { xp: number }) => b.xp - a.xp
                )
                setMotionData(res)
            })
            .catch(() => {
                setLoading(false)
                throw new Error('xPoints DApp: Not able to fetch motions.')
            })
    }

    const handleSubmit = async () => {
        if (loginInfo.zilAddr !== null) {
            try {
                const zilpay = new ZilPayBase()

                const tx_params = Array()

                const tx_action = {
                    vname: 'action',
                    type: 'String',
                    value: 'add',
                }
                tx_params.push(tx_action)

                let id = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr32',
                    selectedId
                )
                const tx_id = {
                    vname: 'id',
                    type: 'Option ByStr32',
                    value: id,
                }
                tx_params.push(tx_id)

                let motion_ = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'String'
                )
                const tx_motion = {
                    vname: 'motion',
                    type: 'Option String',
                    value: motion_,
                }
                tx_params.push(tx_motion)

                const tx_amount = {
                    vname: 'amount',
                    type: 'Uint128',
                    value: String(Number(amount) * 1e12),
                }
                tx_params.push(tx_amount)

                dispatch(setTxStatusLoading('true'))
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: xpoints_addr,
                        transition: 'RaiseYourVoice',
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: String(0),
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        tx = await tx.confirm(res.ID)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            window.open(
                                `https://devex.zilliqa.com/tx/${res.ID
                                }?network=https%3A%2F%2F${net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
                            )
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                        }
                    })
            } catch (error) {
                dispatch(setTxStatusLoading('rejected'))
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
            }
        } else {
            toast.error('some data is missing.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }

    const handleChange = (e) => {
        let value = e.target.value
        if (Number(value) > xpointsBalance!) {
            toast.error('Not enough xPoints', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else {
            setAmount(value)
        }
    }

    const vote = (id: React.SetStateAction<string>) => {
        if (id === selectedId) {
            setSelectedId('')
        } else {
            setSelectedId(id)
        }
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '7%' }}>
            {loading ? (
                <i
                    className="fa fa-lg fa-spin fa-circle-notch"
                    aria-hidden="true"
                ></i>
            ) : (
                <>
                    <h1 style={{ marginBottom: '10%', color: '#ffff32' }}>
                        <span className={styles.x}>x</span>POINTS DApp
                    </h1>
                    {
                        //hideList &&
                        <div style={{ marginTop: '14%' }}>
                            <h3 style={{ marginBottom: '7%', color: 'silver' }}>
                                Raise Your Voice
                            </h3>
                            <div style={{ marginTop: '14%' }}>
                                {hideAdd ? (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            updateNewMotionsModal(true)
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {addLegend}
                                        </p>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideAdd(true)
                                                setAddLegend('new motion')
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {addLegend}
                                            </p>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    }
                    {hideAdd && (
                        <>
                            <div className={styles.wrapperMotion}>
                                {motionData.map((val, i) => (
                                    <div key={i} className={styles.motion}>
                                        <div className={styles.motionContent}>
                                            <div>
                                                <div
                                                    onClick={() => vote(val.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        width: '35px',
                                                        height: '35px',
                                                    }}
                                                >
                                                    <Image
                                                        alt="arrow"
                                                        src={ArrowUp}
                                                        width={35}
                                                        height={35}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        marginTop: '10px',
                                                    }}
                                                >
                                                    {Number(val.xp) / 1e12}
                                                </div>
                                            </div>
                                            <div className={styles.motionTxt}>
                                                {val.motion}
                                            </div>
                                        </div>
                                        {selectedId === val.id && (
                                            <div
                                                className={styles.inputWrapper}
                                            >
                                                <h6>
                                                    add{' '}
                                                    <span
                                                        style={{
                                                            textTransform:
                                                                'lowercase',
                                                        }}
                                                    >
                                                        x
                                                    </span>
                                                    points
                                                </h6>
                                                <input
                                                    style={{
                                                        marginLeft: '3%',
                                                        marginBottom: '10%',
                                                    }}
                                                    type="text"
                                                    placeholder="Type amount"
                                                    onChange={handleChange}
                                                    autoFocus
                                                />
                                                <input
                                                    style={{ marginLeft: '2%' }}
                                                    type="button"
                                                    className={
                                                        'button secondary'
                                                    }
                                                    value={'add'}
                                                    onClick={() => {
                                                        handleSubmit()
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
