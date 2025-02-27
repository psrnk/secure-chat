"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateRandomString } from "@/lib/utils"

export default function CreatePage() {
  const router = useRouter()
  const [privateKey, setPrivateKey] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateKey = () => {
    setIsGenerating(true)
    // Generate a random key
    const key = generateRandomString(16)
    setPrivateKey(key)
    setIsGenerating(false)
  }

  const createChat = () => {
    if (!privateKey) return

    // Create a unique room ID
    const roomId = generateRandomString(10)

    // Store the room ID in localStorage
    localStorage.setItem(
      `room_${roomId}`,
      JSON.stringify({
        created: new Date().toISOString(),
        messages: [],
      }),
    )

    // Navigate to the chat room
    router.push(`/chat/${roomId}?key=${encodeURIComponent(privateKey)}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Create a Secure Chat</CardTitle>
          <CardDescription>Set up a private key for your encrypted chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key</Label>
            <div className="flex space-x-2">
              <Input
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter a private key"
                className="flex-1"
              />
              <Button variant="outline" onClick={generateKey} disabled={isGenerating}>
                Generate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This key will be needed to decrypt messages. Keep it safe and share it only with people you trust.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={createChat} disabled={!privateKey}>
            Create Chat Room
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

