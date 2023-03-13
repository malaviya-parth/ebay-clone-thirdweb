import {
  MediaRenderer,
  useAddress,
  useContract,
  useOwnedNFTs,
  useNetwork,
  useNetworkMismatch,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import { NATIVE_TOKEN_ADDRESS, NFT } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import Header from "../Components/Header";
import network from "../utils/network";

type Props = {};

function listItem({}: Props) {
  const address = useAddress();

  const router = useRouter();

  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );

  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );

  const ownedNfts = useOwnedNFTs(collectionContract, address);

  const [selectedNFT, setSelectedNFT] = useState<NFT>();

  const networkMismatch = useNetworkMismatch();

  const [, switchnetwork] = useNetwork();

  const {
    mutate: createDirectListing,
    isLoading: loadingDirect,
    error: errorDirect,
  } = useCreateDirectListing(contract);

  const {
    mutate: createAuctionListing,
    isLoading: loadingAuction,
    error: errorAuction,
  } = useCreateAuctionListing(contract);

  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (networkMismatch) {
      switchnetwork && switchnetwork(network);
      return;
    }
    if (!selectedNFT) {
      return;
    }

    const target = e.target as typeof e.target & {
      elements: { listingType: { value: string }; price: { value: string } };
    };

    const { listingType, price } = target.elements;

    if (listingType.value === "direct") {
      createDirectListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNFT.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
        },
        {
          onSuccess(data, variables, context) {
            console.log("SUCCESS:", data, variables, context);
            router.push("/");
          },
          onError(error, variables, context) {
            console.log("Error:", error, variables, context);
          },
        }
      );
    }

    if (listingType.value === "auction") {
      createAuctionListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        tokenId: selectedNFT.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7,
        quantity: 1,
        buyoutPricePerToken: price.value,
        startTimestamp: new Date(),
        reservePricePerToken: 0.0001
      },
      {
          onSuccess(data, variables, context) {
            console.log("SUCCESS:", data, variables, context);
            router.push("/");
          },
          onError(error, variables, context) {
            console.log("Error:", error, variables, context);
          },
      }
      );

    }
  };

  return (
    <div>
      <Header />

      <main className=" max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className=" text-2xl font-semibold pt-5">
          Select an item you would like to Sell
        </h2>
        <p>You will the list of your owned NFTs here</p>
        <div className="flex overflow-x-scroll space-x-2 p-2">
          {ownedNfts?.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              onClick={() => {
                setSelectedNFT(nft);
              }}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                nft.metadata.id === selectedNFT?.metadata.id
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              <MediaRenderer
                src={nft.metadata.image}
                className="h-48 rounded-lg"
              />
              <p className="truncate text-lg font-bold">{nft.metadata.name}</p>
              <p className="truncate text-sm font-semibold">
                {nft.metadata.description}
              </p>
            </div>
          ))}
        </div>
        {selectedNFT && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r font-light">Direct Listing</label>
                <input
                  type="radio"
                  name="listingType"
                  className="ml-auto h-10 w-10"
                  value="direct"
                />
                <label className="border-r font-light">Auction Listing</label>
                <input
                  type="radio"
                  name="listingType"
                  className="ml-auto h-10 w-10"
                  value="auction"
                />
                <label className="border-r font-light">Price</label>
                <input
                  type="text"
                  placeholder="0.05"
                  className="bg-gray-100 p-5"
                  name="price"
                />
              </div>
              <button
                type="submit"
                className=" bg-blue-500 rounded-lg text-white p-4 mt-8"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default listItem;
