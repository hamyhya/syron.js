import React from 'react'
import { useStore } from 'effector-react'
import {
    $modalTxMinimized,
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import Arrow from '../../../../src/assets/logos/right-down.png'
import Tick from '../../../../src/assets/logos/tick.png'
import Close from '../../../../src/assets/logos/close.png'
import styles from './styles.module.scss'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'

function Component() {
    const modalTxMinimized = useStore($modalTxMinimized)
    const loginInfo = useSelector((state: RootState) => state.modal)

    const restore = () => {
        updateModalTxMinimized(false)
        updateModalTx(true)
    }

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    )

    if (!modalTxMinimized) {
        return null
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={restore} className={styles.closeIco}>
                            <Image
                                alt="ico-restore"
                                src={Arrow}
                                width={20}
                                height={20}
                            />
                        </div>
                        <div className={styles.contentWrapper}>
                            <h5 className={styles.headerTxt}>
                                Transaction Status
                            </h5>
                            {loginInfo.txStatusLoading === 'confirmed' ? (
                                <div>
                                    <Image
                                        alt="ico-restore"
                                        src={Tick}
                                        width={15}
                                        height={15}
                                    />
                                </div>
                            ) : loginInfo.txStatusLoading === 'failed' ||
                              loginInfo.txStatusLoading === 'rejected' ? (
                                <div>
                                    <Image
                                        alt="ico-restore"
                                        src={Close}
                                        width={15}
                                        height={15}
                                    />
                                </div>
                            ) : (
                                <>{spinner}</>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
