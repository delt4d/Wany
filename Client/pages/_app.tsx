import styles from '@styles/App.module.css';
import '@styles/globals.css';
import type { AppProps } from 'next/app'
import Header from '@components/Header';
import Footer from '@components/Footer';
import { AuthProvider } from '@contexts/auth';
import { SocketContextProvider } from '@contexts/socket';
import { ChatContextProvider } from '@contexts/chat';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SocketContextProvider>
        <ChatContextProvider>
          <Header />
          <main className={styles.Main}>
            <Component {...pageProps} />
          </main>
          <Footer />
        </ChatContextProvider>
      </SocketContextProvider>
    </AuthProvider>
  )
}

export default MyApp
