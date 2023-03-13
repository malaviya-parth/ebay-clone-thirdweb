import { useAddress, useContract } from '@thirdweb-dev/react'
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import Header from '../Components/Header'

type Props = {}

function additem({}: Props) {

    const address = useAddress();

    const {contract} = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,'nft-collection');
    // console.log(contract);

    const [image, setImage] = useState<File>();
    const [preview,setPreview] = useState<string>();

    const router = useRouter();

    const mintNFT = async (e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        if(!contract || !address){
            return;
        }
        if(!image){
            alert("Please select the image");
            return;
        }

        const target = e.target as typeof e.target & {
            name: {value : string};
            description: {value: string};
        }

        const metadata ={
            name: target.name.value,
            description: target.description.value,
            image: image
        }

        if(!preview){
            return(
                <div>
                    Server Error
                </div>
            )
        }

        try{
            const tx = await contract.mintTo(address,metadata);
            const receipt = tx.receipt;
            const tokenId = tx.id;
            const nft = tx.data();  

            router.push('/')
        }catch(e){
            console.error(e);
        }
    }
  return (
    <div>
        <Header/>

        <main className='max-w-6xl p-10 border-2 mx-auto'>
            <h1 className='text-4xl font-bold'>
                Add an Item to the marketplace
            </h1>
            <h2
             className=' text-xl font-semibold pt-5'>
                Item Details
            </h2>
            <p className='pb-5 '>
                By adding an item to the marketplace you are essantially minting an NFT of the item into your wallet which we can then list for sale!
            </p>
            <div className='flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-5'>
                <img className='border w-80 h-80 object-contain' src={preview} alt="" />
                <form onSubmit={mintNFT} className='flex flex-col flex-1 p-2 space-y-2'>
                    <label className='font-light'>Name of Item</label>
                    <input name='name' id='name' type="text" className='form-field' placeholder='Name of Item...' />
                    <label className='font-light' >Description</label>
                    <input type="text" className='form-field' placeholder='Description of Item...' name='description' id='description'/>
                    <label className='font-light'>Input your file</label>
                    <input type="file" className='form-field' 
                        onClick={(e)=>{
                            if((e.target as HTMLInputElement).files?.[0]){
                                setPreview(URL.createObjectURL((e.target as HTMLInputElement).files[0]))
                                setImage((e.target as HTMLInputElement).files[0]);
                            }
                        }}
                    />
                    <button type='submit' className='bg-blue-500 font-bold text-white rounded-xl w-56 mx-auto md:ml-auto py-4 px-10 hover:bg-blue-900'>
                        Add/Mint
                    </button>
                </form>
            </div>
        </main>
    </div>
  )
}

export default additem