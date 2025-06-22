import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Coins, Users, Database } from "lucide-react"

export default function HomePage() {
  // page.tsx içinde herhangi bir yerde
  console.log("My Contract ID is:", process.env.NEXT_PUBLIC_BOOKIE_CONTRACT_ID)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Own Your Data, <span className="text-blue-600">Earn From It</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Bookie Marketplace empowers you to take control of your digital footprint. Upload, encrypt, and monetize
            your personal data while maintaining complete privacy and ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Start Selling Data
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Bookie?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Your data is encrypted client-side before upload. We never see your unencrypted information.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <Coins className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Direct Monetization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Set your own prices and earn directly from buyers. No middlemen taking large cuts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <Database className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Decentralized Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Built on IPFS and Stellar blockchain for maximum security and decentralization.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Ethical Data Economy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Connect data producers with consumers in a transparent, consent-driven marketplace.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Data Producers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Connect Your Wallet</h4>
                    <p className="text-gray-600">Use Freighter wallet to securely connect to the platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload & Encrypt</h4>
                    <p className="text-gray-600">
                      Upload your data files - they're encrypted in your browser before storage
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Set Price & List</h4>
                    <p className="text-gray-600">Choose your price and list your data on the marketplace</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Earn XLM</h4>
                    <p className="text-gray-600">Receive payments directly to your wallet when data is purchased</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Data Consumers</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Browse Marketplace</h4>
                    <p className="text-gray-600">Discover data sets that match your research needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Review Details</h4>
                    <p className="text-gray-600">Check data descriptions, pricing, and seller information</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Purchase Securely</h4>
                    <p className="text-gray-600">Buy data using XLM through secure smart contracts</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Access Data</h4>
                    <p className="text-gray-600">Download and decrypt your purchased data for analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Take Control of Your Data?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the decentralized data economy and start earning from your digital footprint today.
          </p>
          <Link href="/sell">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
