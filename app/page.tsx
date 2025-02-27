import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SecureChat</CardTitle>
          <CardDescription>Create a secure chat room and share it with others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Messages are encrypted end-to-end. Only people with the private key can read them.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/create" passHref>
            <Button size="lg" className="w-full">
              Create New Chat
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

