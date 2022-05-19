import styles from './styles.module.scss'
import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import Image from 'next/image'
import { $user } from '../../src/store/user'
import {
    updateNewMotionsModal,
    updateXpointsBalance,
} from '../../src/store/modal'
import { $net } from '../../src/store/wallet-network'
import { fetchAddr } from '../SearchBar/utils'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import ArrowUp from '../../src/assets/logos/arrow-up.png'

/*
import { useStore } from 'effector-react';
import * as tyron from 'tyron';
import { ZilPayBase } from '../ZilPay/zilpay-base';

*/

function Component() {
    const user = useStore($user)
    const net = useStore($net)
    const [hideAdd, setHideAdd] = useState(true)
    const [loading, setLoading] = useState(true)
    const [showInput, setShowInput] = useState(false)
    const [addLegend, setAddLegend] = useState('new motion')
    const [motionData, setMotionData] = useState(Array())
    const loginInfo = useSelector((state: RootState) => state.modal)

    useEffect(() => {
        fetchXpoints().then(() => {
            fetchMotion().then(() => {
                setLoading(false)
            })
        })
    }, [])

    const fetchXpoints = async () => {
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
                console.log('dd', donate_addr)
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
        await fetchAddr({
            net,
            _username: 'xpoints',
            _domain: 'did',
        })
            .then(async (xpoint_addr) => {
                const state = await init.API.blockchain
                    .getSmartContractState(xpoint_addr)
                    .then(async (state_) => {
                        console.log(state_.result)
                        let arr: any = []

                        for (
                            let i = 0;
                            i < state_.result.motions.length;
                            i += 1
                        ) {
                            const obj = {
                                key: Object.keys(state_.result.motions[i])[0],
                                motion: Object.values(
                                    state_.result.motions[i]
                                )[0],
                                xp: Object.values(state_.result.ranking[i])[0],
                            }
                            arr = [obj, ...arr]
                            console.log(obj)
                        }

                        var res = arr.sort((a, b) => b.xp - a.xp)
                        setMotionData(res)
                    })
                    .catch((err: any) => {
                        throw err
                    })
                return state
            })
            .catch(() => {
                setLoading(false)
                throw new Error('Donate DApp: Not able to fetch balance.')
            })
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
                                            // setHideAdd(false);
                                            // setAddLegend("back");
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
                                                //handleTest();
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
                                <div className={styles.motion}>
                                    <div className={styles.motionContent}>
                                        <div>
                                            <div
                                                onClick={() =>
                                                    setShowInput(!showInput)
                                                }
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Image
                                                    alt="arrow"
                                                    src={ArrowUp}
                                                />
                                            </div>
                                            <h3>64</h3>
                                        </div>
                                        <div className={styles.motionTxt}>
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit. Fusce
                                            sollicitudin vestibulum odio ac
                                            congue. Quisque convallis
                                            sollicitudin semper.
                                        </div>
                                    </div>
                                    {showInput && (
                                        <div className={styles.inputWrapper}>
                                            <input
                                                style={{ marginBottom: '10%' }}
                                                type="text"
                                                placeholder="type number to xPoints to add"
                                                // onChange={handleInput}
                                                // onKeyPress={handleOnKeyPress}
                                                autoFocus
                                            />
                                            <input
                                                style={{ marginLeft: '2%' }}
                                                type="button"
                                                className={'button secondary'}
                                                value={'Vote'}
                                                // onClick={() => {
                                                //     handleSave()
                                                // }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
