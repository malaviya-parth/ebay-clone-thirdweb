import { MediaRenderer, useActiveListings, useContract } from "@thirdweb-dev/react"
import { ListingType } from "@thirdweb-dev/sdk";
import Header from "../Components/Header"

const Home= () => {

  const {contract} = useContract(process.env.MARKETPLACE_CONTRACT,"marketplace");

  const {data: listings, isLoading: loadingListings} = useActiveListings(contract);



  return (
    <div className="">
      <Header/>

      <main className="max-w-6xl mx-auto p-2">
        {loadingListings ?(
          <p className="text-frame animate-bounce text-blue-500">Loading Listings...</p>
        ):
        (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto">
            {listings?.map((listing)=>(
              <div key={listing.id} className="flex card hover:scale-105 flex-col">
                <div className="flex-1 flex flex-col pb-2 items-center">
                  <MediaRenderer className="w-44 " src={listing.asset.image} />
                </div>
                <div>
                  <h2 className="truncate text-lg">
                    {listing.asset.name}
                  </h2>
                  <hr />
                  <p className="text-sm truncate mt-2">
                    {listing.asset.description}
                  </p>
                </div>

                <p className="space-x-1">
                  <span>
                  {listing.buyoutCurrencyValuePerToken.displayValue}
                  </span>
                  {listing.buyoutCurrencyValuePerToken.symbol}
                </p>

                <div className={`flex items-center space-x-1 justify-end border text-xs
                  w-fit ml-auto p-2 rounded-lg text-white  ${listing.type ===
                  ListingType.Direct ? "bg-blue-500" : "bg-red-500"}`}>
                    <p>
                      {listing.type === ListingType.Direct ? "Buy Now" : "Auction"}
                    </p>
                </div>
                </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
