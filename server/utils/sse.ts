// Global array to keep track of connected clients
const clients: any[] = []

export const addClient = (id: string, event: any) => {
  clients.push({ id, event })
}

export const removeClient = (id: string) => {
  const index = clients.findIndex(c => c.id === id)
  if (index !== -1) {
    clients.splice(index, 1)
  }
}

export const broadcast = (data: any) => {
  clients.forEach(client => {
    client.event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
  })
}
