import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react'
import Link from 'next/link';
import React from 'react'

type Props = {}

function Header({}: Props) {

    const connectWithMetamask = useMetamask();
    const disconnect = useDisconnect();
    const address = useAddress();

  return (
    <div className='max-w-6xl mx-auto p-2'>
        <nav className='justify-between flex'>
            <div className='flex space-x-3 text-sm items-center'>
                {address ? (
                <button onClick={disconnect} className='connectWalletBtn'>
                    Hi, {address.slice(0,5)+"..."+address.slice(-4)}
                </button>)
                    :(
                <button onClick={connectWithMetamask} className='connectWalletBtn'>
                    Connect Wallet
                </button>
                )}
                <p className='hidden md:inline-flex cursor-pointer'>Daily Deals</p>
                <p className='hidden md:inline-flex cursor-pointer'>Help & Support</p>
            </div>
            <div className='flex space-x-3 text-sm items-center'>
                <p className='hidden md:inline-flex cursor-pointer'>Ship to</p>
                <p className='hidden md:inline-flex cursor-pointer'>Sell</p>
                <p className='hidden md:inline-flex cursor-pointer'>Watchlist</p>
                <Link className='flex items-center' href="/additem">Add to inventory
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                </Link>
            </div>
        </nav>
        <hr className='mt-2'/>
        <section className='flex space-x-1 items-center py-5'>
            <div className='flex items-center space-x-1 px-2 md:px-5 py-2 border-2 border-black flex-1'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder='Search for anything' className='flex-1 outline-none'/>
            </div>

            <button className='hidden sm:inline connectWalletBtn'>
                Search
            </button>
            <Link className='inline border-2 border-blue-500 px-4 py-2 font-bold text-blue-500 rounded hover:bg-blue-500 hover:text-white' href="/listItem">List Item</Link>
        </section>
        <hr/>
    </div>  
  )
}

export default Header