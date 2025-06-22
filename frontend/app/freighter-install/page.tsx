"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  AlertCircle, 
  Chrome, 
  ExternalLink,
  RefreshCw,
  Download,
  Shield,
  Zap
} from "lucide-react"

export default function FreighterInstallGuidePage() {
  const [freighterStatus, setFreighterStatus] = useState<{
    installed: boolean
    checking: boolean
  }>({ installed: false, checking: true })

  const checkFreighterStatus = () => {
    setFreighterStatus({ checking: true, installed: false })
    
    setTimeout(() => {
      const isInstalled = typeof window !== 'undefined' && !!window.freighterApi
      setFreighterStatus({ 
        installed: isInstalled, 
        checking: false 
      })
    }, 1000)
  }

  useEffect(() => {
    checkFreighterStatus()
  }, [])

  const installSteps = [
    {
      step: 1,
      title: "Visit Freighter Website",
      description: "Go to freighter.app to download the extension",
      action: () => window.open('https://freighter.app/', '_blank'),
      buttonText: "Visit freighter.app"
    },
    {
      step: 2,
      title: "Install Extension",
      description: "Click 'Add to Chrome' or 'Add to Firefox' depending on your browser",
      action: () => window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank'),
      buttonText: "Chrome Web Store"
    },
    {
      step: 3,
      title: "Set Up Wallet",
      description: "Follow the setup process to create or import a Stellar wallet",
      action: null,
      buttonText: "Complete in Extension"
    },
    {
      step: 4,
      title: "Return to Bookie",
      description: "Refresh this page and connect your Freighter wallet",
      action: () => window.location.reload(),
      buttonText: "Refresh Page"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Install Freighter Wallet</h1>
          <p className="text-gray-600">
            Get started with Stellar on the Bookie marketplace
          </p>
        </div>

        {/* Status Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-5 w-5" />
              Freighter Status
              <Button
                variant="ghost"
                size="sm"
                onClick={checkFreighterStatus}
                disabled={freighterStatus.checking}
              >
                <RefreshCw className={`h-4 w-4 ${freighterStatus.checking ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {freighterStatus.checking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span>Checking Freighter installation...</span>
                </>
              ) : freighterStatus.installed ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <span className="text-green-700 font-medium">Freighter is installed!</span>
                    <p className="text-sm text-gray-600 mt-1">
                      You can now go back to the main page and connect your wallet.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/'}
                      className="mt-2"
                      size="sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <span className="text-red-700 font-medium">Freighter not detected</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Follow the installation steps below to get started.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {!freighterStatus.installed && !freighterStatus.checking && (
          <>
            {/* What is Freighter */}
            <Card>
              <CardHeader>
                <CardTitle>What is Freighter?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700">
                  Freighter is a secure, non-custodial browser extension wallet for the Stellar network. 
                  It allows you to safely store, send, and receive Stellar assets directly from your browser.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <h3 className="font-medium">Secure</h3>
                    <p className="text-sm text-gray-600">Your private keys never leave your device</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <h3 className="font-medium">Easy to Use</h3>
                    <p className="text-sm text-gray-600">Simple interface for managing Stellar assets</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Zap className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                    <h3 className="font-medium">Fast Transactions</h3>
                    <p className="text-sm text-gray-600">Quick confirmations on Stellar network</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installation Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Steps</CardTitle>
                <CardDescription>
                  Follow these simple steps to install and set up Freighter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {installSteps.map((step) => (
                    <div key={step.step} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                      {step.action && (
                        <Button
                          onClick={step.action}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {step.step === 1 || step.step === 2 ? (
                            <ExternalLink className="h-4 w-4" />
                          ) : step.step === 4 ? (
                            <RefreshCw className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {step.buttonText}
                        </Button>
                      )}
                      {!step.action && (
                        <Badge variant="secondary">{step.buttonText}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Install Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Install</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => window.open('https://freighter.app/', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Chrome className="h-4 w-4" />
                    Get Freighter
                  </Button>
                  <Button
                    onClick={() => window.open('https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_blank')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Chrome Store
                  </Button>
                  <Button
                    onClick={() => window.open('https://addons.mozilla.org/en-US/firefox/addon/freighter/', '_blank')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Firefox Add-ons
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Extension not appearing after installation?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Refresh this page and check again</li>
                    <li>• Look for the Freighter icon in your browser's extension bar</li>
                    <li>• Try restarting your browser</li>
                    <li>• Make sure you're using Chrome, Firefox, or Edge</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> After installing Freighter, you'll need to set up or import a Stellar wallet 
                    before you can connect to Bookie marketplace.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
