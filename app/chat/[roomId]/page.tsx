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

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  encrypted: boolean
}

export default function ChatRoom({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const privateKey = searchParams.get("key") || ""

  const [username, setUsername] = useState("")
  const [usernameSet, setUsernameSet] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isDecrypting, setIsDecrypting] = useState(false)

  // Load messages from localStorage
  useEffect(() => {
    const roomData = localStorage.getItem(`room_${params.roomId}`)
    if (roomData) {
      const { messages: storedMessages } = JSON.parse(roomData)
      setMessages(storedMessages || [])
    }

    // Check if username is already set in this session
    const storedUsername = sessionStorage.getItem(`username_${params.roomId}`)
    if (storedUsername) {
      setUsername(storedUsername)
      setUsernameSet(true)
    }

    // Set up polling to check for new messages
    const interval = setInterval(() => {
      const freshRoomData = localStorage.getItem(`room_${params.roomId}`)
      if (freshRoomData) {
        const { messages: freshMessages } = JSON.parse(freshRoomData)
        setMessages((prevMessages) => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(freshMessages)) {
            return freshMessages || []
          }
          return prevMessages
        })
      }
    }, 1000)

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

      // Create a new message object
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: username,
        content: encryptedContent,
        timestamp: new Date().toISOString(),
        encrypted: true,
      }

      // Update messages in state and localStorage
      const updatedMessages = [...messages, newMessage]
      setMessages(updatedMessages)

      // Save to localStorage
      const roomData = localStorage.getItem(`room_${params.roomId}`)
      if (roomData) {
        const parsedData = JSON.parse(roomData)
        parsedData.messages = updatedMessages
        localStorage.setItem(`room_${params.roomId}`, JSON.stringify(parsedData))
      }

      // Clear the input
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
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
                Share
              </Button>
              {privateKey && (
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
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full pr-4">
            {messages.length === 0 ? (
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

