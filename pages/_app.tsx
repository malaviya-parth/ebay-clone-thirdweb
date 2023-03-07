import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import network from '../utils/network';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Enclosing under ThirdWebProvider gives components the support to usee all cool stuff under thirdwebprovider object
    <ThirdwebProvider activeChain={network}>
    <Component {...pageProps} />
    </ThirdwebProvider>
  )
}

export default MyApp
