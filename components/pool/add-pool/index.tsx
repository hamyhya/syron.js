/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

import styles from './index.module.scss'
import { useStore } from 'react-stores'
import React from 'react'
import Big from 'big.js'
// import { useTranslation } from 'next-i18next'
import classNames from 'classnames'
// import Link from 'next/link'
import { FormInput, SwapSettings } from '../../swap-form'
import { TokensModal } from '../../Modals/tokens'
import { BackIcon } from '../../icons/back'
import { $tokens } from '../../../src/store/tokens'
import { DragonDex } from '../../../src/mixins/dex'
import { ZERO_ADDR } from '../../../src/config/const'
import { AddPoolPreviewModal } from '../../Modals/add-pool-preview'
import { SwapSettingsModal } from '../../Modals/settings'
import { $liquidity } from '../../../src/store/shares'
import { Token, TokenState } from '../../../src/types/token'
import { $wallet } from '../../../src/store/wallet'
// @ref: ssibrowser ---
import { Share, FiledBalances } from '../../../src/types/zilliqa'
import {
    s$i_tokenState,
    tyron_tokenState,
} from '../../../src/constants/tokens-states'
import { $dex_option, updateDex } from '../../../src/store/dex'
//---

// type Prop = {
//     index: number
// }

const dex = new DragonDex()
// export const AddPoolForm: React.FC<Prop> = ({ index }) => {
export function AddPoolForm() {
    // const pool = useTranslation(`pool`)
    // const tokensStore = useStore($tokens) //dragondex store
    //const liquidity = useStore($liquidity)
    const wallet = useStore($wallet)
    //@ref: ssibrowser ---
    const tyron_init: Token = {
        balance: {
            [wallet?.base16!]: '0',
        },
        meta: tyron_tokenState,
    }
    const s$i_init: Token = {
        balance: {
            [wallet?.base16!]: '0',
        },
        meta: s$i_tokenState,
    }
    let tokensStore: { tokens: Token[] } = { tokens: [s$i_init, tyron_init] }
    let liquidity: { pools: any; shares?: Share; balances?: FiledBalances } = {
        pools: {},
        shares: {},
    }
    const dexname = useStore($dex_option).dex_name
    console.log('DEX NAME: ', dexname)
    let base_index = 0
    let pair_index = 1

    const dragon_tokensStore = useStore($tokens)
    const dragon_liquidity = useStore($liquidity)
    if (dexname !== 'tydradex') {
        tokensStore = dragon_tokensStore
        liquidity = dragon_liquidity
    }
    console.log('tydra_tokens: ', JSON.stringify(tokensStore, null, 2))
    console.log('tydra_liquidity: ', JSON.stringify(liquidity, null, 2))

    //@payzil
    const [pair_amount, setAmount] = React.useState(Big(0))
    const [base_amount, setLimitAmount] = React.useState(Big(0))

    const [token, setToken] = React.useState(pair_index)
    const [tokensModal, setTokensModal] = React.useState(false)
    const [previewModal, setPreviewModal] = React.useState(false)
    const [settingsModal, setSettingsModal] = React.useState(false)

    const tokenBalance = React.useMemo(() => {
        let balance = '0'
        const owner = String(wallet?.base16).toLowerCase()

        if (
            tokensStore.tokens[token] &&
            tokensStore.tokens[token].balance[owner]
        ) {
            balance = tokensStore.tokens[token].balance[owner]
        }

        return Big(balance)
    }, [wallet, tokensStore, token])

    const exceptions = React.useMemo(() => {
        try {
            return [ZERO_ADDR, tokensStore.tokens[token].meta.base16]
        } catch (error) {
            console.error(error)
        }
    }, [tokensStore, token])

    const hasPool = React.useMemo(() => {
        try {
            return Boolean(
                liquidity.pools[tokensStore.tokens[token].meta.base16]
            )
        } catch (error) {
            console.error(error)
            return false
        }
    }, [liquidity, tokensStore, token])

    // const disabled = React.useMemo(() => {
    //     try {
    //         const decimals = dex.toDecimals(
    //             tokensStore.tokens[token].meta.decimals
    //         )
    //         const qa = amount.mul(decimals)
    //         let isLess = false

    //         if (!hasPool) {
    //             const zilDecimals = dex.toDecimals(
    //                 tokensStore.tokens[0].meta.decimals
    //             )
    //             isLess =
    //                 BigInt(String(limitAmount.mul(zilDecimals).round())) <
    //                 dex.lp
    //         }

    //         return Number(amount) === 0 || tokenBalance.lt(qa) || isLess
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }, [tokenBalance, amount, limitAmount, tokensStore, token, hasPool])

    const hanldeSelectToken0 = React.useCallback(
        (t: TokenState) => {
            const foundIndex = tokensStore.tokens.findIndex(
                (p) => p.meta.base16 === t.base16
            )

            if (foundIndex >= 0 && t.base16 !== ZERO_ADDR) {
                setToken(foundIndex)
                setTokensModal(false)
            }
        },
        [tokensStore]
    )

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setPreviewModal(true)
        },
        []
    )

    React.useEffect(() => {
        const tokenMeta = tokensStore.tokens[token].meta
        const pool = liquidity.pools[tokenMeta.base16]

        if (pool && pool.length >= 2) {
            setLimitAmount(dex.calcVirtualAmount(pair_amount, tokenMeta, pool))
        }
    }, [pair_amount, token, liquidity, tokensStore])

    //@ssibrowser
    let token_base
    let balance_base
    let token_pair
    let balance_pair
    try {
        token_pair = tokensStore.tokens[token]?.meta
        balance_pair =
            tokensStore.tokens[token].balance[
                String(wallet?.base16).toLowerCase()
            ]
        token_base = tokensStore.tokens[base_index].meta
        balance_base =
            tokensStore.tokens[base_index].balance[String(wallet).toLowerCase()]
    } catch (error) {
        console.error(error)
    }
    return (
        <>
            <SwapSettingsModal
                show={settingsModal}
                onClose={() => setSettingsModal(false)}
            />
            <TokensModal
                show={tokensModal}
                exceptions={exceptions}
                warn
                include
                onClose={() => setTokensModal(false)}
                onSelect={hanldeSelectToken0}
            />
            <AddPoolPreviewModal
                show={previewModal}
                amount={base_amount}
                limit={pair_amount}
                tokenIndex={token}
                hasPool={hasPool}
                onClose={() => setPreviewModal(false)}
                tokensStore={tokensStore}
            />
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.row}>
                    <div className={styles.txtTitle}>add liquidity</div>
                    <SwapSettings onClick={() => setSettingsModal(true)} />
                </div>
                <div
                    className={classNames(styles.row, {
                        border: true,
                    })}
                >
                    <div className={styles.column}>
                        <h6 className={styles.txtSubtitle}>
                            Select token & amount:
                        </h6>
                        <FormInput
                            value={pair_amount}
                            token={token_pair}
                            // token={tokensStore.tokens[token]?.meta}
                            balance={balance_pair}
                            // balance={
                            //     tokensStore.tokens[token].balance[
                            //     String(wallet?.base16).toLowerCase()
                            //     ]
                            // }
                            onSelect={() => setTokensModal(true)}
                            onInput={setAmount}
                            onMax={setAmount}
                            // @ref: ssibrowser ---
                            noSwap={true}
                            // @ref: ssibrowser -end-
                        />
                        {/* @review: only valid for ZIL-based DEXs (not TydraDEX, which is S$I based) */}
                        <FormInput
                            value={base_amount}
                            token={token_base}
                            balance={balance_base}
                            // token={tokensStore.tokens[base_index].meta}
                            // balance={
                            //     tokensStore.tokens[base_index].balance[
                            //     String(wallet).toLowerCase()
                            //     ]
                            // }
                            // disabled={hasPool}
                            onInput={setLimitAmount}
                            onMax={setLimitAmount}
                            // @ref: ssibrowser ---
                            noSwap={true}
                            // @ref: ssibrowser -end-
                        />
                    </div>
                </div>
                <div
                    onClick={() => setPreviewModal(true)}
                    className={styles.btnWrapper}
                >
                    <div className="button secondary">PREVIEW</div>
                </div>
            </form>
        </>
    )
}
