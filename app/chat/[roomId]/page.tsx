"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { encryptMessage, decryptMessage } from "@/lib/crypto"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { addMessage, getMessages, type Message } from "@/app/actions"

export default function ChatRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const privateKey = searchParams.get("key") || ""

  const [username, setUsername] = useState("")
  const [usernameSet, setUsernameSet] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load messages from server
  useEffect(() => {
    async function loadMessages() {
      try {
        setIsLoading(true)
        const serverMessages = await getMessages(params.roomId)
        setMessages(serverMessages)
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()

    // Check if username is already set in this session
    const storedUsername = sessionStorage.getItem(`username_${params.roomId}`)
    if (storedUsername) {
      setUsername(storedUsername)
      setUsernameSet(true)
    }

    // Set up polling to check for new messages every 3 seconds
    const interval = setInterval(async () => {
      try {
        const freshMessages = await getMessages(params.roomId)
        setMessages(freshMessages)
      } catch (error) {
        console.error("Error polling messages:", error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [params.roomId])

  const setUserUsername = () => {
    if (!username.trim()) return
    sessionStorage.setItem(`username_${params.roomId}`, username)
    setUsernameSet(true)
  }

  const sendMessage = async () => {
    if (!message.trim() || !username || !privateKey) return

    try {
      // Encrypt the message
      const encryptedContent = await encryptMessage(message, privateKey)

      // Send the message to the server
      await addMessage(params.roomId, username, encryptedContent, true)

      // Clear the input
      setMessage("")

      // Immediately fetch messages to update the UI
      const updatedMessages = await getMessages(params.roomId)
      setMessages(updatedMessages)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    }
  }

  const decryptMessages = async () => {
    if (!privateKey) return

    setIsDecrypting(true)

    try {
      // Decrypt all messages
      const decryptedMessages = await Promise.all(
        messages.map(async (msg) => {
          if (msg.encrypted) {
            try {
              const decryptedContent = await decryptMessage(msg.content, privateKey)
              return { ...msg, content: decryptedContent, encrypted: false }
            } catch (error) {
              // If decryption fails, keep the message encrypted
              return msg
            }
          }
          return msg
        }),
      )

      setMessages(decryptedMessages)
    } catch (error) {
      console.error("Error decrypting messages:", error)
    } finally {
      setIsDecrypting(false)
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/chat/${params.roomId}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied!",
      description: "Share this link with others to invite them to the chat",
    })
  }

  const copyKeyShareLink = () => {
    const url = `${window.location.origin}/chat/${params.roomId}?key=${encodeURIComponent(privateKey)}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link with key copied!",
      description: "This link includes the private key. Only share with trusted people.",
    })
  }

  // If username is not set, show the username form
  if (!usernameSet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Join the Chat</CardTitle>
            <CardDescription>Choose a username to identify yourself in the chat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="flex-1"
              />
            </div>
            {privateKey ? (
              <div className="text-sm text-green-600">Private key detected. You'll be able to decrypt messages.</div>
            ) : (
              <div className="text-sm text-amber-600">
                No private key detected. You'll need the key to decrypt messages.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={setUserUsername} disabled={!username.trim()}>
              Join Chat
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto w-full shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Secure Chat</CardTitle>
              <CardDescription>Messages are encrypted end-to-end</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={copyShareLink} className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Share Room
              </Button>
              {privateKey && (
                <>
                  <Button variant="outline" size="sm" onClick={copyKeyShareLink} className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    Share with Key
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decryptMessages}
                    disabled={isDecrypting}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Key: {privateKey.substring(0, 4)}...
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${msg.sender === username ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{msg.sender.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            msg.sender === username ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {msg.encrypted ? (
                            <div className="text-xs opacity-70">
                              {privateKey ? "Click 'Key' to decrypt" : "Enter private key to decrypt"}
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                        <div
                          className={`mt-1 flex text-xs text-muted-foreground ${
                            msg.sender === username ? "justify-end" : ""
                          }`}
                        >
                          <span>{msg.sender}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 pt-2">
          <form
            className="flex w-full space-x-2"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim() || !privateKey}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}

