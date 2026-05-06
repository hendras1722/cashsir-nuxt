export default defineEventHandler((event) => {
  const id = Date.now().toString()
  
  // Set headers for SSE
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')

  // Keep connection open
  event.node.res.write('\n')
  
  addClient(id, event)

  // Remove client on connection close
  event.node.req.on('close', () => {
    removeClient(id)
  })

  // Prevent event from finishing
  return new Promise(() => {})
})
