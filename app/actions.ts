"use server"

import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define types
export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  roomId: string
  encrypted: boolean
}

export interface Room {
  id: string
  created: string
  messages: Message[]
}

// Path to our data file
const DATA_FILE = path.join(process.cwd(), "data", "rooms.json")

// Ensure the data directory exists
function ensureDataDir() {
  const dir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ rooms: {} }))
  }
}

// Get all rooms
function getRooms(): Record<string, Room> {
  ensureDataDir()
  const data = fs.readFileSync(DATA_FILE, "utf8")
  return JSON.parse(data).rooms
}

// Save rooms
function saveRooms(rooms: Record<string, Room>) {
  ensureDataDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify({ rooms }, null, 2))
}

// Create a new room
export async function createRoom(roomId: string): Promise<Room> {
  const rooms = getRooms()

  const newRoom: Room = {
    id: roomId,
    created: new Date().toISOString(),
    messages: [],
  }

  rooms[roomId] = newRoom
  saveRooms(rooms)

  return newRoom
}

// Get a room by ID
export async function getRoom(roomId: string): Promise<Room | null> {
  const rooms = getRooms()
  return rooms[roomId] || null
}

// Add a message to a room
export async function addMessage(
  roomId: string,
  sender: string,
  content: string,
  encrypted: boolean,
): Promise<Message> {
  const rooms = getRooms()

  // Create room if it doesn't exist
  if (!rooms[roomId]) {
    await createRoom(roomId)
  }

  const newMessage: Message = {
    id: uuidv4(),
    sender,
    content,
    timestamp: new Date().toISOString(),
    roomId,
    encrypted,
  }

  rooms[roomId].messages.push(newMessage)
  saveRooms(rooms)

  // Revalidate the chat page to update for all users
  revalidatePath(`/chat/${roomId}`)

  return newMessage
}

// Get messages for a room
export async function getMessages(roomId: string): Promise<Message[]> {
  const room = await getRoom(roomId)
  return room?.messages || []
}

