import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss'

export default function Header() {
  // TODO
  return (
    <div className={styles.contentHeader}>
      <Link href="/">
        <a><Image src="/logo.svg" alt="logo" width="240" height="25" /></a>
      </Link>
    </div>
  )
}
