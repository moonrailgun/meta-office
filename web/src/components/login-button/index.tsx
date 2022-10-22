import React, { memo } from 'react';
import { useGlobalContext } from '../../context';
import styles from './index.module.less';

export const LoginButton: React.FC = memo(() => {
  const { login } = useGlobalContext();

  return (
    <div className={styles.loginButton} onClick={login}>
      Login
    </div>
  );
});
