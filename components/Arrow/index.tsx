import { useSelector } from 'react-redux'
import Image from 'next/image'
import { RootState } from '../../src/app/reducers'
import ContinueArrowReg from '../../src/assets/icons/continue_arrow.svg'
import ContinueArrowYellow from '../../src/assets/icons/continue_arrow_yellow.svg'
import ContinueArrowPurple from '../../src/assets/icons/continue_arrow_purple.svg'
import ContinueArrowBlue from '../../src/assets/icons/continue_arrow_blue.svg'
import styles from './styles.module.scss'

interface Props {
    width?: number
    height?: number
    isBlue?: boolean
}

function Arrow(props: Props) {
    const { width, height, isBlue } = props
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    return (
        <div className={styles.ico}>
            <div className={styles.icoReg}>
                <Image
                    width={width}
                    height={height}
                    src={ContinueArrowReg}
                    alt="continue"
                />
            </div>
            <div className={styles.icoYellow}>
                <Image
                    width={width}
                    height={height}
                    src={
                        ContinueArrowYellow
                        // isBlue
                        //     ? ContinueArrowBlue
                        //     : isLight
                        //     ? ContinueArrowPurple
                        //     : ContinueArrowYellow
                    }
                    alt="continue"
                />
            </div>
        </div>
    )
}

export default Arrow
