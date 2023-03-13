import {
  MediaRenderer,
  useBuyNow,
  useContract,
  useListing,
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useMakeOffer,
  useOffers,
  useAddress,
  useAcceptDirectListingOffer
} from "@thirdweb-dev/react";
import { ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { type } from "os";
import React, { useEffect, useState } from "react";
import Countdown from "react-countdown";
import Header from "../../Components/Header";
import network from "../../utils/network";

type Props = {};

function listingid({}: Props) {
  const router = useRouter();

  // Extracting the id of the item
  // console.log(router.query);
  const { listingid } = router.query as { listingid: string };

  const [minimumBid, setMinimumBid] = useState<{
    displayValue: string;
    symbol: string;
  }>();

  const [bidAmount, setBidAmount] = useState(" ");

  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );

  const { data: listing, isLoading, error } = useListing(contract, listingid);

  const address = useAddress();

  const [, switchNetwork] = useNetwork();

  const networkMismatch = useNetworkMismatch();

  const { mutate: buyNow } = useBuyNow(contract);

  const { mutate: makeBid } = useMakeBid(contract);

  const { data: offers } = useOffers(contract, listingid);

  const { mutate: makeOffer } = useMakeOffer(contract);

  const {mutate: acceptOffer} = useAcceptDirectListingOffer(contract);

  const fetchMinBid = async () => {
    if (!listing || !contract) {
      return;
    }
    const { displayValue, symbol } = await contract.auction.getMinimumNextBid(
      listingid
    );

    setMinimumBid({
      displayValue: displayValue,
      symbol: symbol,
    });
  };
  useEffect(() => {
    if (!listingid || !contract || !listing) {
      return;
    }
    if (listing.type === ListingType.Auction) {
      fetchMinBid();
    }
  }, [listing, listingid, contract]);

  const buyNFT = async () => {
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!listingid || !contract || !listing) {
      return;
    }

    await buyNow(
      {
        id: listingid,
        buyAmount: 1,
        type: listing?.type,
      },
      {
        onSuccess(data, variable, context) {
          alert("NFT Purchased Successfully");
          console.log("SUCCESS: ", data, variable, context);
          router.replace("/"); // Used replace so that user can't go back
        },
        onError(data, variable, context) {
          alert("NFT Purchase Failed");
          console.log("FAIL: ", data, variable, context);
        },
      }
    );
  };

  const createBidOrOffer = async () => {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(network);
        return;
      }

      // Direct Listing
      if (listing?.type === ListingType.Direct) {
        if (
          listing.buyoutPrice.toString() ===
          ethers.utils.parseEther(bidAmount).toString()
        ) {
          console.log("Buyout Price met, buying NFT...");
          buyNFT();
          return;
        }
        console.log("Buyout price not met, making offer...");

        await makeOffer(
          {
            quantity: 1,
            listingid,
            pricePerToken: bidAmount,
          },
          {
            onSuccess(data, variables, context) {
              alert("Offer made successfully");
              console.log("SUCCESS: ", data, variables, context);
              setBidAmount("");
            },
            onError(data, variables, context) {
              alert("ERROR: Offer could not be made");
              console.log("ERROR: ", data, variables, context);
            },
          }
        );
      }

            // Auction Listing
            if (listing?.type === ListingType.Auction) {
                console.log('Making bid...');
        
                await makeBid(
                  {
                    listingid,
                    bid: bidAmount,
                  },
                  {
                    onSuccess(data, variables, context) {
                      alert('Bid made successfully');
                      console.log('SUCCESS: ', data, variables, context);
                      setBidAmount('');
                    },
                    onError(data, variables, context) {
                      alert('ERROR: Bid could not be made');
                      console.log('ERROR: ', data, variables, context);
                    },
                  }
                );
              }

    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header />
        <div>
          <p className="text-center animate-bounce text-blue-500">
            Loading Item...
          </p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div>
        <Header />
        <div>
          <p>Listing Not Found</p>
        </div>
      </div>
    );
  }

  const formatplaceholder = () => {
    if (!listing) {
      return;
    }
    if (listing.type === ListingType.Direct) {
      return "Enter Offer Amount";
    }
    if (listing.type === ListingType.Auction) {
      return Number(minimumBid?.displayValue) === 0
        ? "Enter Bid Amount"
        : `${minimumBid?.displayValue}${minimumBid?.symbol} or more`;
    }
  };

  return (
    <div>
      <Header />
      <main className=" max-w-6xl mx-auto pr-10 p-2 flex flex-col lg:flex-row space-x-5 space-y-10">
        <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
          <MediaRenderer src={listing.asset.image} />
        </div>
        <section>
          <div className="mx-auto">
            <h1 className=" text-xl font-bold">{listing.asset.name}</h1>
            <p className="text-gray-600">{listing.asset.description}</p>
            <p>
              <span className="font-bold pr-1">Seller:</span>
              {listing.sellerAddress}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center py-2">
            <p className="font-bold">Listing Type:</p>
            <p>
              {listing.type === ListingType.Direct
                ? "Direct Listing"
                : "Auction Listing"}
            </p>
            <p>Buy it now Price:</p>
            <p className="font-bold text-2xl">
              {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
              {listing.buyoutCurrencyValuePerToken.symbol}
            </p>
            <button
              onClick={buyNFT}
              className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10"
            >
              Buy Now
            </button>
          </div>

          {listing.type === ListingType.Direct && offers && (
            <div className="grid grid-cols-2 gap-y-2">
              <p className="font-bold">Offers: </p>
              <p className="font-bold">
                {offers.length > 0 ? offers.length : 0}
              </p>

              {offers.map((offer) => {
                <>
                  <p className="flex items-center ml-5 text-sm italic">
                    {offer.offeror.slice(0, 5) +
                      '...' +
                      offer.offeror.slice(-5)}
                  </p>
                  <div>
                    <p
                      className="text-sm italic"
                      key={
                        offer.listingId +
                        offer.offeror +
                        offer.totalOfferAmount.toString()
                      }
                    >
                      {ethers.utils.formatEther(offer.totalOfferAmount)}{' '}
                      {NATIVE_TOKENS[network].symbol}
                    </p>
                    {listing.sellerAddress === address && (
                      <button
                        onClick={() => {
                          acceptOffer(
                            {
                              listingid,
                              addressOfOfferor: offer.offeror,
                            },
                            {
                              onSuccess(data, variables, context) {
                                alert('Offer accepted successfully!');
                                console.log(
                                  'SUCCESS: ',
                                  data,
                                  variables,
                                  context
                                );
                                router.replace('/');
                              },
                              onError(data, variables, context) {
                                alert('ERROR: Offer could not be accept');
                                console.log(
                                  'ERROR: ',
                                  data,
                                  variables,
                                  context
                                );
                              },
                            }
                          );
                        }}
                        className="p-2 w-32 bg-red-500/50 rounded-lg"
                      >
                        Accept Offer
                      </button>
                    )}
                  </div>
                </>;
              })}
            </div>
          )}

          <div className="grid grid-cols-2 space-y-2 items-center justify-end">
            <hr className="col-span-2" />
            <p className="col-span-2 font-bold">
              {listing.type === ListingType.Direct
                ? "Make an offer"
                : "Bid on this Auction"}
            </p>

            {listing.type === ListingType.Auction && (
              <>
                <p>Current Minimum Bid:</p>
                <p className="font-bold">
                  {minimumBid?.displayValue}
                  {minimumBid?.symbol}
                </p>

                <p>Time Remaining:</p>
                <Countdown
                  date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}
                />
              </>
            )}

            <input
              onChange={(e) => setBidAmount(e.target.value)}
              className="p-2 border rounded-lg mr-5"
              type="text"
              placeholder={formatplaceholder()}
            />
            <button
              onClick={createBidOrOffer}
              className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10"
            >
              {listing.type === ListingType.Direct ? "Offer" : "Bid"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default listingid;
