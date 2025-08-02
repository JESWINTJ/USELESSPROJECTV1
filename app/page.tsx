"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Home, Users, Volume2, VolumeX, Play, Pause, RotateCcw, Trophy, Grid3X3, Music } from "lucide-react"

interface Message {
  id: string
  speaker: string
  content: string
  timestamp: Date
  room: string
}

interface FamilyMember {
  name: string
  personality: string
  avatar: string
  room: string
  color: string
  responses: string[]
  reactions: { [key: string]: string[] }
  animations: string[]
  gameReactions: string[]
}

interface GameState {
  isActive: boolean
  currentPlayer: string
  currentRoom: string
  tilesFound: number
  timeLeft: number
  targetTiles: number
  highScore: number
  gamePhase: "waiting" | "playing" | "finished"
  roomTiles: { [key: string]: number }
}

const familyMembers: FamilyMember[] = [
  {
    name: "Dad",
    personality: "A dad who loves dad jokes, grilling, and complaining about the thermostat",
    avatar: "👨‍🦳",
    room: "Living Room",
    color: "bg-blue-100 text-blue-800",
    animations: ["🤔", "😤", "🍔", "🔧", "📺", "💸", "🏠"],
    gameReactions: [
      "Why are we counting tiles? This is ridiculous!",
      "Back in my day, we just walked on floors without counting them.",
      "I installed these tiles myself, there should be exactly...",
      "This is harder than fixing the garbage disposal!",
      "Who designed this floor pattern anyway?",
    ],
    responses: [
      "Who touched the thermostat?!",
      "Back in my day, we didn't need all these gadgets.",
      "I'm firing up the grill this weekend!",
      "Why is the electric bill so high?",
      "Did someone leave the lights on again?",
      "I just want to watch the game in peace.",
      "These kids and their phones...",
      "When I was your age, we walked uphill both ways!",
      "Anyone want to help me with the yard work?",
      "The weather's perfect for grilling!",
    ],
    reactions: {
      Mom: ["Yes dear, I'll handle it.", "Don't worry about it, honey.", "Let me take care of that."],
      Teenager: ["Dad, that's so cringe.", "Whatever, Dad.", "Can we not do this right now?"],
      Grandpa: ["You remind me of myself at your age!", "That's my boy!", "Listen to your father, kids."],
      "Little Sister": ["Daddy, can we play outside?", "Are you making burgers?", "Can I help with the grill?"],
    },
  },
  {
    name: "Mom",
    personality: "A caring mom who's always worried about everyone and loves organizing",
    avatar: "👩‍🦰",
    room: "Kitchen",
    color: "bg-pink-100 text-pink-800",
    animations: ["😊", "😰", "🍳", "🧹", "💊", "🧥", "🛒", "📸"],
    gameReactions: [
      "I clean these tiles every day, I should know how many there are!",
      "This is actually quite organized and methodical.",
      "Make sure you don't miss the corners!",
      "I hope this helps with spatial awareness skills.",
      "The kitchen tiles are the hardest because of the pattern.",
    ],
    responses: [
      "Has everyone eaten breakfast?",
      "Don't forget to take your vitamins!",
      "We need to clean the house before guests arrive.",
      "Did everyone brush their teeth?",
      "I'm making your favorite dinner tonight.",
      "Make sure to wear a jacket, it's cold outside!",
      "Who wants to help me with the groceries?",
      "Remember, family dinner is at 6 PM sharp.",
      "I found some old photos we should look at together.",
      "Everyone needs to clean their rooms today.",
    ],
    reactions: {
      Dad: ["Honey, you worry too much.", "Thanks for taking care of everything.", "What would we do without you?"],
      Teenager: ["Mom, I'm fine!", "Do I have to?", "Can I do it later?"],
      Grandpa: ["You're such a wonderful mother.", "The family is lucky to have you.", "Just like your grandmother."],
      "Little Sister": ["Mommy, I love you!", "Can we bake cookies?", "I already brushed my teeth!"],
    },
  },
  {
    name: "Teenager",
    personality: "A sarcastic teenager who thinks everything is cringe and uses lots of slang",
    avatar: "🧑‍🎓",
    room: "Bedroom",
    color: "bg-purple-100 text-purple-800",
    animations: ["🙄", "😴", "📱", "🎧", "💸", "🤦‍♂️", "😒", "🆒"],
    gameReactions: [
      "This is literally the most boring game ever invented.",
      "Why can't we just use an app to count tiles?",
      "I'm losing brain cells doing this, no cap.",
      "This is somehow more tedious than homework.",
      "At least it's better than family board game night...",
    ],
    responses: [
      "This family is so cringe, no cap.",
      "Can I get some privacy please?",
      "Y'all are being so extra right now.",
      "I'm literally dying of embarrassment.",
      "That's not how you use that app, Mom.",
      "Can we get some normal food for once?",
      "My friends' families are way cooler.",
      "I need money for... stuff.",
      "Why is everyone so loud?",
      "I'm too tired for family time.",
    ],
    reactions: {
      Dad: ["Dad jokes are not funny.", "That's so boomer of you.", "Can you not?"],
      Mom: ["Mom, you're being dramatic.", "I'm literally fine.", "Stop worrying about everything."],
      Grandpa: ["Grandpa, that story is ancient.", "Times have changed, Grandpa.", "OK boomer."],
      "Little Sister": ["You're so annoying, sis.", "Leave me alone.", "Go play with your toys."],
    },
  },
  {
    name: "Grandpa",
    personality: "An old-fashioned grandpa who tells stories about 'back in my day' and gives life advice",
    avatar: "👴",
    room: "Study",
    color: "bg-amber-100 text-amber-800",
    animations: ["🤓", "📚", "⚔️", "🚶‍♂️", "💰", "👨‍👩‍👧‍👦", "🏫", "🕰️"],
    gameReactions: [
      "In my day, we built houses and knew every tile by heart!",
      "This reminds me of when I helped build this house...",
      "Counting is good for the mind, keeps you sharp!",
      "I remember when these floors were just dirt!",
      "Patience, young ones. Good things take time.",
    ],
    responses: [
      "Back in my day, we respected our elders.",
      "Let me tell you about the war...",
      "Kids these days don't know how good they have it.",
      "I remember when this whole neighborhood was farmland.",
      "Hard work never killed anyone.",
      "You should save your money, not spend it on nonsense.",
      "Family is the most important thing in life.",
      "I walked 5 miles to school every day!",
      "We didn't have all these fancy gadgets.",
      "Respect is earned, not given.",
    ],
    reactions: {
      Dad: ["You taught me well, Dad.", "Those were different times.", "I remember those stories."],
      Mom: ["You're so wise, Grandpa.", "Tell us more stories!", "The kids should hear this."],
      Teenager: ["Here we go again...", "Grandpa, it's 2024.", "That's ancient history."],
      "Little Sister": ["Tell me more stories, Grandpa!", "Were there really dinosaurs?", "You're so old and cool!"],
    },
  },
  {
    name: "Little Sister",
    personality: "An energetic 8-year-old who asks lots of questions and gets excited about everything",
    avatar: "👧",
    room: "Playroom",
    color: "bg-green-100 text-green-800",
    animations: ["🤩", "🐶", "🎨", "🍦", "🧱", "❓", "🏞️", "🧸", "😴", "🫖"],
    gameReactions: [
      "This is like a treasure hunt but with squares!",
      "I love counting! One, two, three, four...",
      "Can we count the ceiling tiles next?",
      "Why are some tiles different colors?",
      "I'm gonna be the best tile counter ever!",
    ],
    responses: [
      "Can we get a puppy? Please please please?",
      "Why is the sky blue?",
      "I drew a picture of our family!",
      "Can we have ice cream for breakfast?",
      "Look what I made with my LEGOs!",
      "Why do grown-ups work so much?",
      "Can we go to the park today?",
      "I lost my favorite toy, help me find it!",
      "Why do I have to go to bed so early?",
      "Can we have a tea party?",
    ],
    reactions: {
      Dad: ["Daddy, you're the best!", "Can you teach me to grill?", "Will you play with me?"],
      Mom: ["Mommy, I love you so much!", "Can we bake together?", "You're the prettiest mommy ever!"],
      Teenager: ["Why are you so mean to me?", "I want to be cool like you!", "Can I hang out with your friends?"],
      Grandpa: ["Grandpa, you're so funny!", "Tell me about the old days!", "Can you teach me checkers?"],
    },
  },
]

const houseRooms = [
  { name: "Kitchen", tiles: 48, pattern: "🟫⬜", difficulty: "Hard" },
  { name: "Living Room", tiles: 72, pattern: "🟤🟫", difficulty: "Medium" },
  { name: "Bathroom", tiles: 24, pattern: "⬜🔵", difficulty: "Easy" },
  { name: "Bedroom", tiles: 56, pattern: "🟫🟤", difficulty: "Medium" },
  { name: "Study", tiles: 32, pattern: "🟤⬜", difficulty: "Easy" },
  { name: "Playroom", tiles: 64, pattern: "🌈🟫", difficulty: "Hard" },
]

export default function AIFamilyHouse() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isActive, setIsActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeSpeaker, setActiveSpeaker] = useState<string>("")
  const [memberAnimations, setMemberAnimations] = useState<{ [key: string]: string }>({})
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    currentPlayer: "",
    currentRoom: "",
    tilesFound: 0,
    timeLeft: 15,
    targetTiles: 0,
    highScore: 0,
    gamePhase: "waiting",
    roomTiles: {},
  })
  const [showGame, setShowGame] = useState(false)
  const [showMusicRoom, setShowMusicRoom] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastSpeakerRef = useRef<string>("")
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const animateMember = (memberName: string) => {
    const member = familyMembers.find((m) => m.name === memberName)
    if (!member) return

    setActiveSpeaker(memberName)

    // Set random animation emoji
    const randomAnimation = member.animations[Math.floor(Math.random() * member.animations.length)]
    setMemberAnimations((prev) => ({ ...prev, [memberName]: randomAnimation }))

    // Clear animation after 3 seconds
    setTimeout(() => {
      setActiveSpeaker("")
      setMemberAnimations((prev) => ({ ...prev, [memberName]: member.avatar }))
    }, 3000)
  }

  const addGameMessage = (speaker: string, content: string) => {
    const member = familyMembers.find((m) => m.name === speaker)!
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      speaker,
      content,
      timestamp: new Date(),
      room: "Game Room",
    }
    setMessages((prev) => [...prev, newMessage])
    animateMember(speaker)
  }

  const startGame = () => {
    const players = ["Dad", "Mom", "Teenager", "Grandpa", "Little Sister"]
    const randomPlayer = players[Math.floor(Math.random() * players.length)]
    const randomRoom = houseRooms[Math.floor(Math.random() * houseRooms.length)]

    setGameState({
      isActive: true,
      currentPlayer: randomPlayer,
      currentRoom: randomRoom.name,
      tilesFound: 0,
      timeLeft: 15,
      targetTiles: randomRoom.tiles,
      highScore: gameState.highScore,
      gamePhase: "playing",
      roomTiles: gameState.roomTiles,
    })

    addGameMessage(randomPlayer, `I'll count the tiles in the ${randomRoom.name}! This should be... interesting.`)

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          // Game over - calculate accuracy
          const accuracy = Math.max(0, 100 - Math.abs(prev.tilesFound - prev.targetTiles) * 2)
          const finalScore = Math.floor(accuracy + Math.random() * 20)
          const newHighScore = Math.max(prev.highScore, finalScore)

          // Add game over message
          setTimeout(() => {
            const difference = Math.abs(prev.tilesFound - prev.targetTiles)
            let reactionMessage = ""

            if (difference === 0) {
              reactionMessage = `Perfect! I counted exactly ${prev.targetTiles} tiles! I'm a tile-counting master!`
            } else if (difference <= 3) {
              reactionMessage = `Close! I counted ${prev.tilesFound} tiles, but there are ${prev.targetTiles}. Only off by ${difference}!`
            } else {
              reactionMessage = `Oops! I counted ${prev.tilesFound} tiles, but there are actually ${prev.targetTiles}. I was off by ${difference}!`
            }

            addGameMessage(prev.currentPlayer, reactionMessage)

            // Sometimes other family members comment
            if (Math.random() < 0.8) {
              setTimeout(() => {
                const otherMembers = familyMembers.filter((m) => m.name !== prev.currentPlayer)
                const commenter = otherMembers[Math.floor(Math.random() * otherMembers.length)]
                const gameReaction = commenter.gameReactions[Math.floor(Math.random() * commenter.gameReactions.length)]
                addGameMessage(commenter.name, gameReaction)
              }, 2000)
            }
          }, 500)

          return {
            ...prev,
            isActive: false,
            timeLeft: 0,
            highScore: newHighScore,
            gamePhase: "finished",
            roomTiles: { ...prev.roomTiles, [prev.currentRoom]: prev.tilesFound },
          }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    // Simulate counting progress
    const countingInterval = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isActive) {
          clearInterval(countingInterval)
          return prev
        }

        // Random counting progress (sometimes they miscount!)
        const increment = Math.random() < 0.9 ? 1 : Math.random() < 0.5 ? 0 : 2
        const newCount = prev.tilesFound + increment

        // Random progress comments
        if (Math.random() < 0.15) {
          const progressComments = [
            `Hmm, ${newCount} so far...`,
            `This is trickier than I thought! ${newCount} tiles...`,
            `Wait, did I count that one already? ${newCount}...`,
            `${newCount} tiles and counting!`,
            `These patterns are confusing! ${newCount}...`,
          ]
          const randomComment = progressComments[Math.floor(Math.random() * progressComments.length)]
          setTimeout(() => addGameMessage(prev.currentPlayer, randomComment), 100)
        }

        return { ...prev, tilesFound: newCount }
      })
    }, 800)
  }

  const resetGame = () => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
    }
    setGameState({
      isActive: false,
      currentPlayer: "",
      currentRoom: "",
      tilesFound: 0,
      timeLeft: 15,
      targetTiles: 0,
      highScore: gameState.highScore,
      gamePhase: "waiting",
      roomTiles: gameState.roomTiles,
    })
  }

  const generateLocalConversation = () => {
    if (!isActive) return

    // Pick a random family member to speak (avoid same speaker twice in a row)
    let availableMembers = familyMembers.filter((member) => member.name !== lastSpeakerRef.current)
    if (availableMembers.length === 0) availableMembers = familyMembers

    const speaker = availableMembers[Math.floor(Math.random() * availableMembers.length)]
    lastSpeakerRef.current = speaker.name

    let content: string

    // 30% chance to react to the last message, 70% chance for random response
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && Math.random() < 0.3 && speaker.reactions[lastMessage.speaker]) {
      const reactions = speaker.reactions[lastMessage.speaker]
      content = reactions[Math.floor(Math.random() * reactions.length)]
    } else {
      content = speaker.responses[Math.floor(Math.random() * speaker.responses.length)]
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      speaker: speaker.name,
      content,
      timestamp: new Date(),
      room: speaker.room,
    }

    setMessages((prev) => [...prev, newMessage])
    animateMember(speaker.name)
  }

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(
      () => {
        generateLocalConversation()
      },
      3000 + Math.random() * 4000, // Random interval between 3-7 seconds
    )

    return () => clearInterval(interval)
  }, [isActive, messages])

  const startConversation = () => {
    setIsActive(true)
    // Initialize all member animations with their default avatars
    const initialAnimations: { [key: string]: string } = {}
    familyMembers.forEach((member) => {
      initialAnimations[member.name] = member.avatar
    })
    setMemberAnimations(initialAnimations)

    // Start with a random greeting
    const greetings = [
      { speaker: "Mom", content: "Good morning everyone! Breakfast is ready!" },
      { speaker: "Dad", content: "Who's ready for the weekend?" },
      { speaker: "Little Sister", content: "Can we do something fun today?" },
      { speaker: "Grandpa", content: "Beautiful morning, isn't it?" },
      { speaker: "Teenager", content: "Why is everyone so loud this early?" },
    ]

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    const member = familyMembers.find((m) => m.name === randomGreeting.speaker)!

    const initialMessage: Message = {
      id: Date.now().toString(),
      speaker: randomGreeting.speaker,
      content: randomGreeting.content,
      timestamp: new Date(),
      room: member.room,
    }

    setMessages([initialMessage])
    lastSpeakerRef.current = randomGreeting.speaker
    animateMember(randomGreeting.speaker)
  }

  const stopConversation = () => {
    setIsActive(false)
    setActiveSpeaker("")
    resetGame()
    // Reset all animations to default avatars
    const defaultAnimations: { [key: string]: string } = {}
    familyMembers.forEach((member) => {
      defaultAnimations[member.name] = member.avatar
    })
    setMemberAnimations(defaultAnimations)
  }

  const clearConversation = () => {
    setMessages([])
    lastSpeakerRef.current = ""
    setIsActive(false)
    setActiveSpeaker("")
    setMemberAnimations({})
    resetGame()
  }

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
      }
    }
  }, [])

  const currentRoom = houseRooms.find((room) => room.name === gameState.currentRoom)

  if (showMusicRoom) {
    return <MusicRoom onBack={() => setShowMusicRoom(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Home className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Family House</h1>
          </div>
          <p className="text-gray-600 text-lg">Watch our digital family members chat with each other in real-time!</p>
          <Badge variant="outline" className="mt-2">
            🏠 Now with House Tile Counter!
          </Badge>
        </div>

        {/* Family Members */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {familyMembers.map((member) => (
            <Card
              key={member.name}
              className={`text-center transition-all duration-300 ${
                activeSpeaker === member.name
                  ? "ring-4 ring-orange-400 shadow-lg scale-105 bg-orange-50"
                  : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-4">
                <div
                  className={`text-4xl mb-2 transition-all duration-500 ${
                    activeSpeaker === member.name ? "animate-bounce scale-125" : "hover:scale-110"
                  }`}
                >
                  {memberAnimations[member.name] || member.avatar}
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <Badge variant="secondary" className="text-xs mt-1">
                  {member.room}
                </Badge>
                {activeSpeaker === member.name && (
                  <div className="mt-2">
                    <Badge variant="default" className="animate-pulse text-xs">
                      Speaking...
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={isActive ? stopConversation : startConversation}
            className="flex items-center gap-2"
            size="lg"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? "Pause Family Chat" : "Start Family Chat"}
          </Button>

          <Button onClick={() => setShowGame(!showGame)} variant="outline" size="lg">
            <Grid3X3 className="w-4 h-4 mr-2" />
            {showGame ? "Hide Game" : "Show Tile Counter"}
          </Button>

          <Button onClick={() => setShowMusicRoom(true)} variant="outline" size="lg">
            <Music className="w-4 h-4 mr-2" />
            Music Room
          </Button>

          <Button onClick={clearConversation} variant="outline" size="lg">
            Clear Chat
          </Button>

          <Button onClick={() => setIsMuted(!isMuted)} variant="outline" size="lg">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Game Room */}
        {showGame && (
          <Card className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />🏠 Game Room: "House Tile Counter"
                <Badge variant="secondary">Utterly Pointless!</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Game Area */}
                <div className="text-center">
                  <div className="flex justify-center gap-4 mb-4">
                    <Badge variant="outline">
                      <Trophy className="w-3 h-3 mr-1" />
                      Best Accuracy: {gameState.highScore}%
                    </Badge>
                    {gameState.isActive && <Badge variant="default">Time: {gameState.timeLeft}s</Badge>}
                  </div>

                  {gameState.gamePhase === "waiting" && (
                    <div>
                      <p className="text-gray-600 mb-4">Count the tiles in a random room as accurately as possible!</p>
                      <Button onClick={startGame} size="lg" className="mb-4">
                        Start Tile Counting
                      </Button>
                    </div>
                  )}

                  {gameState.gamePhase === "playing" && currentRoom && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        {gameState.currentPlayer} is counting tiles in the {gameState.currentRoom}
                      </p>
                      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                        <div className="text-4xl mb-2">{currentRoom.pattern}</div>
                        <div className="text-6xl font-bold text-orange-600 animate-pulse">{gameState.tilesFound}</div>
                        <p className="text-sm text-gray-500">tiles counted</p>
                      </div>
                      <Badge variant="outline" className="mb-2">
                        Target: {gameState.targetTiles} tiles ({currentRoom.difficulty})
                      </Badge>
                    </div>
                  )}

                  {gameState.gamePhase === "finished" && (
                    <div>
                      <p className="text-lg font-bold mb-2">Counting Complete!</p>
                      <p className="text-gray-600 mb-4">
                        {gameState.currentPlayer} counted {gameState.tilesFound} tiles
                        <br />
                        (Actual: {gameState.targetTiles} tiles)
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button onClick={startGame} size="lg">
                          Count Again
                        </Button>
                        <Button onClick={resetGame} variant="outline" size="lg">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* House Rooms */}
                <div>
                  <h3 className="font-semibold mb-4 text-center">House Floor Plan</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {houseRooms.map((room) => (
                      <Card
                        key={room.name}
                        className={`p-3 text-center ${
                          gameState.currentRoom === room.name ? "ring-2 ring-orange-400 bg-orange-50" : ""
                        }`}
                      >
                        <div className="text-2xl mb-1">{room.pattern}</div>
                        <div className="text-sm font-semibold">{room.name}</div>
                        <div className="text-xs text-gray-500">{room.tiles} tiles</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {room.difficulty}
                        </Badge>
                        {gameState.roomTiles[room.name] && (
                          <div className="text-xs text-blue-600 mt-1">Last count: {gameState.roomTiles[room.name]}</div>
                        )}
                      </Card>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Each room has different tile patterns and difficulty levels!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Display */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Family Conversation
              {isActive && (
                <Badge variant="default" className="ml-2 animate-pulse">
                  Live
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>The house is quiet... Click "Start Family Chat" to begin!</p>
                  <p className="text-sm mt-2">🏠 Try the Tile Counter for maximum uselessness!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const member = familyMembers.find((m) => m.name === message.speaker)
                  const isCurrentSpeaker = activeSpeaker === message.speaker
                  const isGameMessage = message.room === "Game Room"
                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 transition-all duration-300 ${
                        isCurrentSpeaker ? "scale-105" : ""
                      } ${isGameMessage ? "bg-amber-50 p-2 rounded-lg border-l-4 border-amber-400" : ""}`}
                    >
                      <div
                        className={`text-2xl transition-all duration-300 ${
                          isCurrentSpeaker ? "animate-pulse scale-125" : ""
                        }`}
                      >
                        {isGameMessage ? "🏠" : memberAnimations[message.speaker] || member?.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={member?.color}>{message.speaker}</Badge>
                          <Badge variant={isGameMessage ? "default" : "outline"} className="text-xs">
                            {message.room}
                          </Badge>
                          <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                          {isCurrentSpeaker && (
                            <Badge variant="default" className="text-xs animate-pulse">
                              🗣️ Speaking
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-gray-800 bg-white p-3 rounded-lg shadow-sm transition-all duration-300 ${
                            isCurrentSpeaker ? "bg-orange-50 border-l-4 border-orange-400" : ""
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>🏠 A completely useless but entertaining AI family simulation</p>
          <p className="text-sm mt-2">Perfect for hackathons and procrastination!</p>
          <p className="text-xs mt-1">🏠 Now with the world's most pointless tile counting game!</p>
        </div>
      </div>
    </div>
  )
}

// Separate Music Room Component with Speech Synthesis
function MusicRoom({ onBack }: { onBack: () => void }) {
  const [inputSong, setInputSong] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLines, setCurrentLines] = useState<string[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [playedSongs, setPlayedSongs] = useState<string[]>([])
  const [volume, setVolume] = useState([70])
  const [speed, setSpeed] = useState([1.0])
  const [isMuted, setIsMuted] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speechSupported, setSpeechSupported] = useState(false)

  // Initialize Speech Synthesis and get available voices
  useEffect(() => {
    // Check if speech synthesis is supported
    if ("speechSynthesis" in window) {
      setSpeechSupported(true)

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()
        console.log("Available voices:", voices.length)
        setAvailableVoices(voices)
      }

      // Load voices immediately
      loadVoices()

      // Also load when voices change (some browsers load them asynchronously)
      speechSynthesis.addEventListener("voiceschanged", loadVoices)

      return () => {
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      }
    } else {
      console.log("Speech synthesis not supported")
      setSpeechSupported(false)
    }
  }, [])

  // Different voice types with unique characteristics
  const getVoiceForLine = (lineIndex: number) => {
    if (availableVoices.length === 0) return null

    // Use different voices in rotation
    const voiceTypes = [
      { name: "Voice 1", pitch: 0.8, rate: 0.9 * speed[0] },
      { name: "Voice 2", pitch: 1.2, rate: 1.0 * speed[0] },
      { name: "Voice 3", pitch: 0.6, rate: 0.8 * speed[0] },
      { name: "Voice 4", pitch: 1.4, rate: 1.1 * speed[0] },
      { name: "Voice 5", pitch: 1.0, rate: 0.7 * speed[0] },
      { name: "Voice 6", pitch: 1.0, rate: 1.3 * speed[0] },
    ]

    const voiceType = voiceTypes[lineIndex % voiceTypes.length]
    const voice = availableVoices[lineIndex % availableVoices.length]

    return {
      voice,
      name: voiceType.name,
      pitch: voiceType.pitch,
      rate: voiceType.rate,
    }
  }

  // Speak a line using Speech Synthesis
  const speakLine = (text: string, lineIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!text.trim() || isMuted || !speechSupported) {
        console.log("Skipping speech:", { text: text.trim(), isMuted, speechSupported })
        resolve()
        return
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      const voiceConfig = getVoiceForLine(lineIndex)

      if (voiceConfig && voiceConfig.voice) {
        utterance.voice = voiceConfig.voice
        utterance.pitch = voiceConfig.pitch
        utterance.rate = voiceConfig.rate
      }

      utterance.volume = volume[0] / 100

      console.log("Speaking:", text, "with voice:", voiceConfig?.voice?.name)

      utterance.onend = () => {
        console.log("Speech ended for:", text)
        resolve()
      }

      utterance.onerror = (event) => {
        console.error("Speech error:", event)
        resolve()
      }

      // Small delay to ensure previous speech is cancelled
      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 100)
    })
  }

  const handlePlaySong = () => {
    if (!inputSong.trim()) return

    console.log("Starting song playback")

    // Split the song into lines and reverse the order
    const lines = inputSong
      .trim()
      .split("\n")
      .filter((line) => line.trim())
    const reversedLines = lines.reverse()

    setCurrentLines(reversedLines)
    setCurrentLineIndex(-1)
    setIsPlaying(true)

    // Add to played songs history
    setPlayedSongs((prev) => [inputSong, ...prev.slice(0, 4)])

    // Use a recursive function to play lines sequentially
    const playNextLine = (index: number) => {
      if (index >= reversedLines.length) {
        // All lines completed
        console.log("Song playback complete")
        setIsPlaying(false)
        setCurrentLineIndex(-1)
        return
      }

      console.log(`Speaking line ${index + 1}:`, reversedLines[index])
      setCurrentLineIndex(index)

      // Create the speech utterance
      const utterance = new SpeechSynthesisUtterance(reversedLines[index])
      const voiceConfig = getVoiceForLine(index)

      if (voiceConfig && voiceConfig.voice) {
        utterance.voice = voiceConfig.voice
        utterance.pitch = voiceConfig.pitch
        utterance.rate = voiceConfig.rate
      }

      utterance.volume = volume[0] / 100
      utterance.rate = (voiceConfig?.rate || 1.0) * speed[0]

      utterance.onend = () => {
        console.log("Speech ended for:", reversedLines[index])
        // Wait 1 second then play next line
        setTimeout(() => {
          playNextLine(index + 1)
        }, 1000)
      }

      utterance.onerror = (event) => {
        console.error("Speech error:", event)
        // Continue to next line even on error
        setTimeout(() => {
          playNextLine(index + 1)
        }, 1000)
      }

      // Cancel any ongoing speech and speak this line
      speechSynthesis.cancel()
      setTimeout(() => {
        speechSynthesis.speak(utterance)
      }, 100)
    }

    // Start playing from the first line
    playNextLine(0)
  }

  const stopPlaying = () => {
    console.log("Stopping playback")
    setIsPlaying(false)
    setCurrentLineIndex(-1)
    speechSynthesis.cancel() // Stop any ongoing speech
  }

  const clearInput = () => {
    setInputSong("")
    stopPlaying()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      speechSynthesis.cancel() // Stop current speech when muting
    }
  }

  // Test speech function
  const testSpeech = () => {
    const utterance = new SpeechSynthesisUtterance("Hello! This is a test of the speech synthesis.")
    utterance.volume = volume[0] / 100
    utterance.rate = speed[0]
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">🎤 Singing Brother's Music Room</h1>
          </div>
          <p className="text-gray-600 text-lg">Enter a song and hear it sung from bottom to top with real voices!</p>
          <Badge variant="outline" className="mt-2">
            🎵 Reverse Line Singing with Speech Synthesis
          </Badge>
          {!speechSupported && (
            <Badge variant="destructive" className="mt-2 block">
              ⚠️ Speech synthesis not supported in this browser
            </Badge>
          )}
        </div>

        {/* Back Button and Audio Controls */}
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="outline">
            ← Back to Family House
          </Button>

          <div className="flex items-center gap-4">
            <Button onClick={testSpeech} variant="outline" size="sm" disabled={!speechSupported}>
              🔊 Test Speech
            </Button>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-24" disabled={isMuted} />
              <span className="text-sm text-gray-600 w-8">{isMuted ? "0" : volume[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">🏃 Speed:</span>
              <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2.0} step={0.1} className="w-24" />
              <span className="text-sm text-gray-600 w-12">{speed[0].toFixed(1)}x</span>
            </div>
            <Button onClick={toggleMute} variant="outline" size="sm">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Voice Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                🎭 Available Voices: {availableVoices.length}
              </Badge>
              <p className="text-sm text-gray-600">
                Each line will be spoken by a different voice with unique pitch and speed!
              </p>
              {availableVoices.length === 0 && speechSupported && (
                <p className="text-xs text-orange-600 mt-2">
                  Loading voices... If this persists, try the "Test Speech" button first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Song Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎵 Enter Your Song</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Song Lyrics (will be spoken from bottom to top with different voices):
                </label>
                <textarea
                  value={inputSong}
                  onChange={(e) => setInputSong(e.target.value)}
                  placeholder="Enter your song lyrics here...
Each line will be spoken in reverse order with different voices!

Example:
Mary had a little lamb
Its fleece was white as snow
And everywhere that Mary went
The lamb was sure to go

Will be spoken as:
The lamb was sure to go 🗣️
And everywhere that Mary went 🗣️
Its fleece was white as snow 🗣️
Mary had a little lamb 🗣️"
                  className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none text-sm"
                  disabled={isPlaying}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePlaySong}
                  disabled={!inputSong.trim() || isPlaying || !speechSupported}
                  className="flex-1"
                >
                  {isPlaying ? "🗣️ Speaking..." : "🎤 Speak Song"}
                </Button>
                <Button onClick={stopPlaying} variant="outline" disabled={!isPlaying}>
                  ⏹️ Stop
                </Button>
                <Button onClick={clearInput} variant="outline" disabled={isPlaying}>
                  🗑️ Clear
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 Tip: Try the "Test Speech" button first and adjust speed/volume controls!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Song Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎤 Singing Brother Performance
              {isPlaying && <Badge className="animate-pulse">🗣️ Live Speaking</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-64 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg">
              {currentLines.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-6xl mb-4">🎤</div>
                  <p>Enter a song above and click "Speak Song" to hear the performance!</p>
                  <p className="text-sm mt-2">🔊 Make sure your volume is up and try "Test Speech" first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className={`text-4xl ${isPlaying ? "animate-bounce" : ""}`}>🎤</div>
                    <p className="text-sm text-gray-600 mt-2">
                      {isPlaying ? "🗣️ Now speaking with different voices..." : "🗣️ Performance complete!"}
                    </p>
                    {isPlaying && (
                      <div className="flex justify-center items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                        <span className="text-xs text-gray-500 ml-2">Voice Speaking</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {currentLines.map((line, index) => {
                      const voiceConfig = getVoiceForLine(index)
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg text-center text-lg font-mono transition-all duration-500 border-2 ${
                            index === currentLineIndex
                              ? "bg-indigo-200 text-indigo-900 scale-105 shadow-lg animate-pulse ring-4 ring-indigo-400 border-indigo-500"
                              : index < currentLineIndex
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-gray-100 text-gray-400 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {index < currentLineIndex && <span className="text-green-600">✅</span>}
                            {index === currentLineIndex && <span className="text-indigo-600 animate-bounce">🗣️</span>}
                            {index > currentLineIndex && <span className="text-gray-400">⏳</span>}
                            <span>
                              Line {index + 1}: {line}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Voice: {voiceConfig?.name || "Default"}
                            {voiceConfig?.voice && ` (${voiceConfig.voice.name})`}
                          </div>
                          {index === currentLineIndex && (
                            <div className="flex justify-center mt-2">
                              <Badge variant="default" className="animate-pulse text-xs">
                                🗣️ Speaking as {voiceConfig?.name || "Default"} - Line {index + 1} of{" "}
                                {currentLines.length}
                              </Badge>
                            </div>
                          )}
                          {index < currentLineIndex && (
                            <div className="flex justify-center mt-2">
                              <Badge variant="secondary" className="text-xs">
                                ✅ Spoken by {voiceConfig?.name || "Default"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Song History */}
        {playedSongs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🎵 Recently Spoken Songs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playedSongs.map((song, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 truncate flex-1">
                        {song.split("\n")[0]}... ({song.split("\n").length} lines)
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInputSong(song)
                        }}
                        disabled={isPlaying}
                      >
                        🔄 Replay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>🎤 The most useless way to experience music - now with actual speech!</p>
          <p className="text-sm mt-2">Perfect for confusing yourself and others with backwards spoken songs!</p>
          <p className="text-xs mt-1">🗣️ Each line gets spoken by a completely different voice</p>
        </div>
      </div>
    </div>
  )
}
