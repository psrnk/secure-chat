
# SecureChat

A simple, modern, end-to-end encrypted chat application that allows users to share messages securely through shareable links.

![SecureChat Screenshot](/placeholder.svg?height=400&width=800)

## Features

- 🔐 **End-to-End Encryption**: All messages are encrypted using AES-GCM via the Web Crypto API
- 🔗 **Shareable Links**: Easily share chat rooms with others
- 🔑 **Private Key Access**: Only users with the correct private key can decrypt messages
- 👤 **Custom Usernames**: Users can choose their own display names
- 💻 **Client-Side Only**: No server required, works entirely in the browser
- 📱 **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Create a Chat Room**: Generate a new chat room with a unique private key
2. **Share the Link**: Send the chat room link to people you want to chat with
3. **Share the Key**: Separately share the private key with trusted recipients
4. **Join the Chat**: Enter a username to identify yourself in the chat
5. **Send Encrypted Messages**: All messages are automatically encrypted
6. **Decrypt Messages**: Use the private key to decrypt and read messages

## Security Model

SecureChat uses a simple but effective security model:

- Messages are encrypted using the AES-GCM algorithm via the Web Crypto API
- The encryption key never leaves your browser
- Messages are stored encrypted in localStorage
- The chat room link and private key should be shared separately for maximum security
- No data is sent to any server (client-side only)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/psrnk/sec-chat.git
   cd securechat