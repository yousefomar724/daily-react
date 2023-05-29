import { useEffect, useRef, useState } from 'react'
import DailyIframe from '@daily-co/daily-js'

const App = () => {
  const [roomUrl, setRoomUrl] = useState('')

  const iframeRef = useRef(null)
  const callFrameRef = useRef(null)
  const roomNameRef = useRef(null)

  const createRoom = async (roomName) => {
    const apiKey = import.meta.env.VITE_DAILY_API_KEY
    const url = 'https://api.daily.co/v1/rooms'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            enable_chat: true,
            start_video_off: true,
            start_audio_off: false,
            lang: 'en',
          },
        }),
      })

      if (response.status === 200) {
        const roomData = await response.json()
        setRoomUrl(roomData.url)
      } else {
        throw new Error('Failed to create room')
      }
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    const roomName = roomNameRef.current.value
    // Create the Daily.co room with the specified room name
    // and set the room URL in the state
    createRoom(roomName)
  }

  useEffect(() => {
    if (!roomUrl) return

    const callFrame = DailyIframe.wrap(iframeRef.current, {
      showLeaveButton: true,
      showFullscreenButton: true,
    })
    callFrameRef.current = callFrame

    const joinCall = async () => {
      try {
        await callFrame.join({ url: roomUrl })
      } catch (error) {
        console.error('Error joining the room:', error)
      }
    }

    joinCall()

    return () => {
      callFrameRef.current = null
    }
  }, [roomUrl])

  return (
    <div className=''>
      <form onSubmit={handleFormSubmit}>
        <input type='text' ref={roomNameRef} placeholder='Enter room name' />
        <button type='submit'>Create/Join Room</button>
      </form>
      <iframe
        title='Video Chat'
        ref={iframeRef}
        src='daily.co'
        allow='camera https://itqan.daily.co; microphone https://itqan.daily.co'
      />
    </div>
  )
}

export default App
