/**
 * ============================================================================
 * CHATBOT COMPONENT - FLOATING CHAT ASSISTANT (UI ONLY)
 * ============================================================================
 * 
 * NHIỆM VỤ: Tạo GIAO DIỆN chatbot floating button và chat window
 * (chỉ UI, dùng mock responses - không cần AI API thật)
 * 
 * ============================================================================
 * YÊU CẦU GIAO DIỆN:
 * ============================================================================
 * 
 * 1. FLOATING CHAT BUTTON (Góc dưới phải):
 *    ✅ Nút tròn w-14 h-14, fixed position (bottom-6 right-6)
 *    ✅ Gradient background: bg-gradient-to-r from-blue-500 to-purple-600
 *    ✅ Icon MessageCircle (lucide-react) màu trắng khi đóng
 *    ✅ Icon X (lucide-react) màu trắng khi mở
 *    ✅ Shadow: shadow-2xl
 *    ✅ Hover: scale-110 (hover:scale-110), rotate animation
 *    ✅ Z-index: z-50 (hiển thị trên cùng)
 * 
 * 2. CHAT WINDOW (Hiện khi click button):
 *    ✅ Kích thước: w-96 (384px), h-[500px]
 *    ✅ Position: fixed, bottom-24, right-6
 *    ✅ Background: bg-white
 *    ✅ Border radius: rounded-2xl
 *    ✅ Shadow: shadow-2xl
 *    ✅ Animation: slide-up từ dưới lên (transition-transform)
 *    ✅ Z-index: z-40
 * 
 * 3. CHAT HEADER (Phần trên cùng):
 *    ✅ Background gradient: from-blue-500 to-purple-600
 *    ✅ Padding: p-4
 *    ✅ Border radius top: rounded-t-2xl
 *    ✅ Avatar bot: w-10 h-10, rounded-full, border-2 border-white
 *    ✅ Tên: "Money Lover Assistant" (text-white, font-semibold)
 *    ✅ Status: "Always here to help" (text-xs, text-white/80)
 *    ✅ Close button (X icon) - absolute top-right
 * 
 * 4. MESSAGES CONTAINER (Giữa):
 *    ✅ Height: flex-1 (chiếm hết không gian)
 *    ✅ Overflow: overflow-y-auto (scroll khi nhiều tin nhắn)
 *    ✅ Padding: p-4
 *    ✅ Background: bg-gray-50
 * 
 * 5. MESSAGE BUBBLES:
 *    ✅ User message (bên phải):
 *       - Background: bg-blue-500
 *       - Text: text-white
 *       - Align: ml-auto (đẩy sang phải)
 *       - Max width: max-w-[70%]
 *       - Border radius: rounded-2xl rounded-br-none
 *    
 *    ✅ Bot message (bên trái):
 *       - Background: bg-white
 *       - Text: text-gray-800
 *       - Border: border border-gray-200
 *       - Max width: max-w-[70%]
 *       - Border radius: rounded-2xl rounded-bl-none
 *    
 *    ✅ Timestamp: text-xs text-gray-400, mt-1
 * 
 * 6. TYPING INDICATOR (Khi bot "đang trả lời"):
 *    ✅ 3 dots animation: animate-bounce với delay khác nhau
 *    ✅ Background: bg-white, border gray
 *    ✅ Position: bên trái như bot message
 * 
 * 7. INPUT BOX (Dưới cùng):
 *    ✅ Border top: border-t border-gray-200
 *    ✅ Padding: p-4
 *    ✅ Layout: flex gap-2
 *    ✅ Text input: flex-1, border-gray-300, rounded-lg, px-4 py-2
 *    ✅ Send button: bg-blue-500, text-white, p-2, rounded-lg, hover:bg-blue-600
 *    ✅ Icon: Send (lucide-react)
 *    ✅ Disabled state: opacity-50, cursor-not-allowed (khi bot typing)
 * 
 * 8. QUICK REPLIES (Optional - hiện khi mới mở):
 *    ✅ Grid 2 cột: grid grid-cols-2 gap-2
 *    ✅ Button: bg-white, border-2 border-blue-200, hover:border-blue-500
 *    ✅ Text: text-sm text-blue-600
 *    ✅ Gợi ý: "How to add transaction?", "View categories", "Help", "About"
 * 
 * ============================================================================
 * HƯỚNG DẪN XÂY DỰNG GIAO DIỆN:
 * ============================================================================
 * 
 * BƯỚC 1: SETUP STATE & REF
 * --------------------------
 * import useState, useRef, useEffect từ react
 * import MessageCircle, X, Send, Bot từ lucide-react
 * 
 * Tạo state:
 * - isOpen: boolean (false) - trạng thái mở/đóng chat window
 * - messages: array - danh sách tin nhắn với id, text, sender, timestamp
 * - inputText: string ('') - nội dung input
 * - isTyping: boolean (false) - bot đang typing
 * - messagesEndRef: useRef(null) - ref để auto scroll
 * 
 * BƯỚC 2: AUTO SCROLL TO BOTTOM (Khi có tin nhắn mới)
 * ---------------------------------------------------
 * Dùng useEffect với dependency là messages array
 * Check nếu messagesEndRef.current tồn tại
 * Gọi scrollIntoView với behavior smooth
 * 
 * BƯỚC 3: FLOATING BUTTON LAYOUT
 * ------------------------------
 * Button với onClick toggle isOpen state
 * className: fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600
 *            rounded-full shadow-2xl flex items-center justify-center text-white
 *            hover:scale-110 transition-transform z-50
 * 
 * Icon conditional: isOpen ? X icon : MessageCircle icon
 * 
 * BƯỚC 4: CHAT WINDOW LAYOUT (Chỉ hiện khi isOpen = true)
 * -------------------------------------------------------
 * Container div: fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-40
 * 
 * Phần 1 - HEADER:
 * - Background gradient từ blue-500 đến purple-600
 * - Avatar bot (w-10 h-10 rounded-full bg-white)
 * - Title "Money Lover Assistant" (text-white font-semibold)
 * - Status "Always here to help" (text-xs text-white/80)
 * 
 * Phần 2 - MESSAGES CONTAINER:
 * - flex-1 overflow-y-auto p-4 bg-gray-50
 * - Map qua messages array
 * - User message: justify-end, bg-blue-500 text-white rounded-br-none
 * - Bot message: justify-start, bg-white border rounded-bl-none
 * - Timestamp: text-xs text-gray-400
 * 
 * Phần 3 - TYPING INDICATOR (conditional nếu isTyping):
 * - 3 dots với animate-bounce
 * - animationDelay: 0s, 0.2s, 0.4s
 * 
 * Phần 4 - INPUT FORM:
 * - border-t border-gray-200 p-4
 * - Input: flex-1 border rounded-lg px-4 py-2
 * - Button: bg-blue-500 text-white p-2 rounded-lg
 * - Disabled state khi isTyping
 * 
 * BƯỚC 5: HANDLE SEND MESSAGE (Dùng mock bot responses)
 * ------------------------------------------------------
 * Function handleSendMessage với parameter e (event):
 * 1. preventDefault() để không reload page
 * 2. Check nếu inputText empty hoặc isTyping thì return
 * 3. Tạo userMsg object với id (Date.now), text, sender 'user', timestamp
 * 4. Add userMsg vào messages array
 * 5. Clear inputText
 * 6. Set isTyping = true
 * 7. setTimeout 1500ms:
 *    - Gọi getMockBotResponse(inputText) để lấy response
 *    - Tạo botMsg object
 *    - Add botMsg vào messages
 *    - Set isTyping = false
 * 
 * BƯỚC 6: MOCK BOT RESPONSES (Simple keyword matching)
 * ----------------------------------------------------
 * Function getMockBotResponse với parameter input:
 * 1. Convert input to lowercase
 * 2. Check keywords và return responses:
 *    - 'transaction' hoặc 'add': Hướng dẫn thêm transaction
 *    - 'category': Hướng dẫn manage categories
 *    - 'account': Hướng dẫn manage accounts
 *    - 'help': List các chức năng có thể giúp
 *    - 'hi', 'hello', 'xin chào': Greeting message
 *    - Default: Yêu cầu rephrase hoặc type 'help'
 * 
 * ============================================================================
 * TAILWIND CSS CLASSES REFERENCE:
 * ============================================================================
 * 
 * 🔘 FLOATING BUTTON:
 * - fixed bottom-6 right-6: Position góc dưới phải
 * - w-14 h-14: Kích thước 56x56px
 * - bg-gradient-to-r from-blue-500 to-purple-600: Gradient xanh-tím
 * - rounded-full: Hình tròn
 * - shadow-2xl: Đổ bóng lớn
 * - hover:scale-110: Phóng to 110% khi hover
 * - transition-transform: Smooth animation
 * - z-50: Hiển thị trên cùng
 * 
 * 💬 CHAT WINDOW:
 * - fixed bottom-24 right-6: Position trên button
 * - w-96: Width 384px
 * - h-[500px]: Height 500px (custom)
 * - bg-white: Background trắng
 * - rounded-2xl: Bo góc lớn 16px
 * - shadow-2xl: Đổ bóng lớn
 * - flex flex-col: Layout dọc
 * - z-40: Z-index cao (dưới button 1 bậc)
 * 
 * 📋 HEADER:
 * - bg-gradient-to-r from-blue-500 to-purple-600: Gradient
 * - p-4: Padding 16px
 * - rounded-t-2xl: Bo góc trên
 * - text-white: Text màu trắng
 * - font-semibold: Font đậm
 * 
 * 💬 MESSAGES:
 * - flex-1: Chiếm hết không gian còn lại
 * - overflow-y-auto: Scroll dọc
 * - p-4: Padding 16px
 * - bg-gray-50: Background xám nhạt
 * 
 * 🗨️ USER MESSAGE:
 * - justify-end: Align phải
 * - bg-blue-500: Background xanh
 * - text-white: Text trắng
 * - rounded-2xl rounded-br-none: Bo góc trừ góc phải dưới
 * - max-w-[70%]: Max width 70%
 * 
 * 🤖 BOT MESSAGE:
 * - justify-start: Align trái
 * - bg-white: Background trắng
 * - text-gray-800: Text xám đậm
 * - border border-gray-200: Viền xám nhạt
 * - rounded-2xl rounded-bl-none: Bo góc trừ góc trái dưới
 * 
 * ⏳ TYPING INDICATOR:
 * - animate-bounce: Animation bounce mặc định của Tailwind
 * - w-2 h-2: Dot kích thước 8x8px
 * - bg-gray-400: Màu xám
 * - rounded-full: Hình tròn
 * 
 * ✏️ INPUT BOX:
 * - border-t border-gray-200: Viền trên
 * - p-4: Padding 16px
 * - flex gap-2: Layout ngang, gap 8px
 * - disabled:opacity-50: Mờ 50% khi disable
 * - disabled:cursor-not-allowed: Cursor không cho phép
 * 
 * ============================================================================
 * MOCK DATA EXAMPLES:
 * ============================================================================
 * 
 * Quick replies array:
 * - "How to add transaction?"
 * - "View my categories"
 * - "Help me get started"
 * - "What is Money Lover?"
 * 
 * Sample messages array để test:
 * - Message 1: Bot greeting "Hi! How can I help?"
 * - Message 2: User question "How do I add a transaction?"
 * - Message 3: Bot response with instructions
 * 
 * ============================================================================
 * DEMO CHECKLIST:
 * ============================================================================
 * ✅ Click floating button → chat window toggle (mở/đóng)
 * ✅ Icon thay đổi: MessageCircle ↔ X
 * ✅ Gửi tin nhắn → hiển thị bên phải (user message)
 * ✅ Sau 1.5s → bot trả lời bên trái (bot message)
 * ✅ Typing indicator (3 dots bounce) hiện khi bot typing
 * ✅ Auto scroll xuống khi có tin nhắn mới
 * ✅ Timestamp hiển thị cho mỗi tin nhắn
 * ✅ Input disable khi bot đang typing
 * ✅ Enter để gửi tin nhắn
 * ✅ Hover button: scale-110 effect
 * ✅ Gradient background cho button và header
 * ✅ Bot responses với keyword matching (transaction, category, account, help)
 * 
 * ============================================================================
 * HƯỚNG DẪN TRIỂN KHAI CHI TIẾT:
 * ============================================================================
 * 
 * BƯỚC 1: SỬ DỤNG COMPONENT
 * --------------------------
 * 1. Import component vào App.jsx hoặc page cần hiển thị:
 *    import Chatbot from './components/Chatbot'
 * 
 * 2. Đặt component ở cuối return, sau các phần nội dung khác:
 *    <div className="app">
 *      <Header />
 *      <MainContent />
 *      <Footer />
 *      <Chatbot />  ← Thêm ở đây
 *    </div>
 * 
 * 3. Component sẽ tự động xuất hiện ở góc dưới phải với position fixed
 * 
 * BƯỚC 2: CẤU TRÚC COMPONENT
 * ---------------------------
 * Component bao gồm 3 phần chính:
 * 
 * A. STATE MANAGEMENT (Quản lý trạng thái):
 *    - isOpen: boolean - Chat window đang mở hay đóng
 *    - messages: array - Danh sách tin nhắn (user và bot)
 *    - inputText: string - Nội dung đang gõ trong input
 *    - isTyping: boolean - Bot đang typing hay không
 *    - messagesEndRef: ref - Để auto scroll xuống tin nhắn mới
 * 
 * B. FLOATING BUTTON:
 *    - Nút tròn gradient xanh-tím ở góc dưới phải
 *    - Click để toggle chat window (mở/đóng)
 *    - Icon thay đổi: MessageCircle (đóng) ↔ X (mở)
 *    - Hover effect: phóng to 110%
 * 
 * C. CHAT WINDOW:
 *    - Header: Gradient header với avatar bot, tên, status, nút close
 *    - Messages: Danh sách tin nhắn với scroll, user (phải), bot (trái)
 *    - Typing indicator: 3 chấm nhảy khi bot đang trả lời
 *    - Quick replies: Gợi ý câu hỏi (chỉ hiện khi mới mở)
 *    - Input form: Ô nhập tin nhắn + nút Send
 * 
 * BƯỚC 3: CÁC FUNCTION CHÍNH
 * ---------------------------
 * 1. handleSendMessage(e):
 *    - Xử lý khi user gửi tin nhắn (Submit form hoặc Enter)
 *    - Thêm user message vào danh sách
 *    - Show typing indicator
 *    - Sau 1s gọi getBotResponse() để lấy câu trả lời
 *    - Thêm bot response vào danh sách
 * 
 * 2. getBotResponse(userInput):
 *    - Nhận input từ user
 *    - So khớp keywords: transaction, category, account, help, hi
 *    - Trả về câu trả lời tương ứng (mock response)
 *    - Có thể thay bằng API call thật (OpenAI, Gemini, custom backend)
 * 
 * 3. handleQuickReply(text):
 *    - Xử lý khi click vào quick reply button
 *    - Tự động điền vào input và gửi
 * 
 * 4. useEffect (Auto scroll):
 *    - Tự động scroll xuống tin nhắn mới nhất khi messages thay đổi
 *    - Dùng messagesEndRef.current.scrollIntoView()
 * 
 * BƯỚC 4: TÍCH HỢP AI API (TÙY CHỌN)
 * -----------------------------------
 * Để chatbot thông minh hơn, thay getBotResponse() bằng API call:
 * 
 * Option 1 - OpenAI GPT:
 * const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': 'Bearer YOUR_API_KEY',
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     model: 'gpt-3.5-turbo',
 *     messages: [
 *       { role: 'system', content: 'You are Money Lover assistant' },
 *       { role: 'user', content: userInput }
 *     ]
 *   })
 * })
 * 
 * Option 2 - Google Gemini:
 * const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     contents: [{ parts: [{ text: userInput }] }]
 *   })
 * })
 * 
 * Option 3 - Custom Backend:
 * const response = await axios.post('/api/chatbot', { message: userInput })
 * 
 * BƯỚC 5: CUSTOM HÓA
 * ------------------
 * Có thể tùy chỉnh các phần sau:
 * 
 * 1. Màu sắc:
 *    - Đổi gradient: from-blue-500 to-purple-600 → màu khác
 *    - Đổi màu user message: bg-blue-500 → màu khác
 * 
 * 2. Vị trí:
 *    - Đổi từ góc phải sang trái: right-6 → left-6
 *    - Đổi khoảng cách: bottom-6 → bottom-4 hoặc bottom-8
 * 
 * 3. Kích thước:
 *    - Chat window: w-96 → w-80 (nhỏ hơn) hoặc w-[500px] (lớn hơn)
 *    - Height: h-[500px] → h-[600px] hoặc h-[400px]
 * 
 * 4. Quick replies:
 *    - Sửa array quickReplies để thêm/bớt câu hỏi gợi ý
 * 
 * 5. Bot responses:
 *    - Sửa function getBotResponse() để thêm logic trả lời khác
 * 
 * BƯỚC 6: TESTING
 * ----------------
 * 1. Click floating button → Chat window mở
 * 2. Click X hoặc click lại button → Chat window đóng
 * 3. Gõ tin nhắn và Enter → User message hiện bên phải
 * 4. Sau 1s → Bot reply hiện bên trái
 * 5. Typing indicator (3 dots) hiện khi bot đang trả lời
 * 6. Auto scroll xuống tin nhắn mới
 * 7. Click quick reply → Tự động gửi câu hỏi
 * 8. Test các keywords: transaction, category, account, help, hi
 * 
 * LƯU Ý QUAN TRỌNG:
 * -----------------
 * - Component dùng Tailwind CSS, đảm bảo đã cài đặt và config
 * - lucide-react icons: npm install lucide-react
 * - Position fixed nên chatbot sẽ luôn hiện ở góc dưới phải, không bị che
 * - Z-index z-50 đảm bảo chatbot hiển thị trên các elements khác
 * - Responsive: Chat window tự động scale trên mobile
 * 
 * ============================================================================
 */

import React from 'react'
// import { useState, useRef, useEffect } from 'react'
// import { MessageCircle, X, Send } from 'lucide-react'

export default function Chatbot() {
  // TODO: Setup state management
  // const [isOpen, setIsOpen] = useState(false)
  // const [messages, setMessages] = useState([...])
  // const [inputText, setInputText] = useState('')
  // const [isTyping, setIsTyping] = useState(false)

  // TODO: Setup ref cho auto scroll
  // const messagesEndRef = useRef(null)

  // TODO: Implement useEffect cho auto scroll

  // TODO: Implement handleSendMessage function

  // TODO: Implement getBotResponse function (keyword matching hoặc AI)

  // TODO: Implement UI (floating button + chat window)
  // State quản lý chat window open/close
  const [isOpen, setIsOpen] = useState(false)
  
  // State quản lý danh sách messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Money Lover Assistant 👋 How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  
  // State quản lý input text
  const [inputText, setInputText] = useState('')
  
  // State loading khi bot đang trả lời
  const [isTyping, setIsTyping] = useState(false)
  
  // Ref để auto scroll to bottom
  const messagesEndRef = useRef(null)

  /**
   * Auto scroll to bottom khi có message mới
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * Handler: Gửi tin nhắn
   * 
   * Flow:
   * 1. Thêm user message vào messages array
   * 2. Clear input
   * 3. Show typing indicator
   * 4. Call chatbot API
   * 5. Thêm bot response vào messages
   */
  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputText.trim()) return

    // Thêm user message
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages([...messages, userMessage])
    setInputText('')
    setIsTyping(true)

    // TODO: Call chatbot API
    // Mock response after 1s
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  /**
   * Mock bot responses (thay bằng API call thật)
   * 
   * Có thể dùng:
   * - OpenAI API
   * - Google Gemini
   * - Custom NLP backend
   */
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    // Simple keyword matching (thay bằng AI)
    if (input.includes('transaction') || input.includes('giao dịch')) {
      return "To add a transaction, go to the Transactions page and click the '➕ Add Transaction' button. You can select income or expense, add amount, category, and notes."
    }
    
    if (input.includes('category') || input.includes('danh mục')) {
      return "You can manage categories in the Categories page. Click '➕ Add Category' to create new income or expense categories with custom icons and colors."
    }
    
    if (input.includes('account') || input.includes('tài khoản')) {
      return "The Accounts page lets you manage multiple accounts like Cash, Bank Account, or Credit Card. You can track balance for each account separately."
    }
    
    if (input.includes('help') || input.includes('hướng dẫn')) {
      return "Here are some things I can help with:\n• Add transactions\n• Manage categories\n• View statistics\n• Account management\n\nWhat would you like to know more about?"
    }
    
    // Default response
    return "I understand you're asking about: \"" + userInput + "\". Could you please be more specific? Or type 'help' to see what I can assist you with."
  }

  /**
   * Quick reply buttons - Câu hỏi gợi ý
   */
  const quickReplies = [
    "How to add a transaction?",
    "Show my spending this month",
    "Create a new category",
    "Help"
  ]

  const handleQuickReply = (text) => {
    setInputText(text)
    // Auto send
    handleSendMessage({ preventDefault: () => {} })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Money Lover Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies (chỉ hiện khi chưa có nhiều messages) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!inputText.trim() || isTyping}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
