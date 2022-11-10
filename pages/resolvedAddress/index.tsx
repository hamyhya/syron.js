import Layout from '../../components/Layout'
import { Headline, Services } from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import styles from '../styles.module.scss'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { updateModalNewSsi } from '../../src/store/modal'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { Router, useRouter } from 'next/router'

function ResolvedAddress() {
    const Router = useRouter()
    const { t } = useTranslation()
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                {loginInfo.address !== null && (
                    <div className={styles.addressWrapper}>
                        {resolvedInfo?.addr ? (
                            <div style={{ marginBottom: '4%' }}>
                                <p className={styles.headerSubTitle}>
                                    RESOLVED ADDRESS
                                </p>
                                <a
                                    className={styles.address}
                                    href={`https://v2.viewblock.io/zilliqa/address/${loginInfo.address}?network=${net}`}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    zil...
                                    {zcrypto
                                        ?.toBech32Address(resolvedInfo?.addr!)
                                        ?.slice(-10)}
                                </a>
                            </div>
                        ) : (
                            <div
                                onClick={() => Router.push('/')}
                                className={
                                    isLight ? 'actionBtnLight' : 'actionBtn'
                                }
                            >
                                NO RESOLVED INFO
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default ResolvedAddress
