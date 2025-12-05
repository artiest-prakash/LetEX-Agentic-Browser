
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { MainViewport } from './components/MainViewport';
import { processUrlInput, isLikelyToBlock, isValidUrl, transformUrlForEmbed } from './utils/urlHandler';
import { sendMessageToGemini } from './services/gemini';
import { auth, signInWithGoogle, logOut, saveThread, getUserThreads, getUserNotes } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Message, User, Thread, Note } from './types';

const App: React.FC = () => {
  // Default to closed on mobile, open on desktop
  // We also check localStorage for user preference if available
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isSidebarOpen');
      if (savedState !== null) return JSON.parse(savedState);
      return window.innerWidth >= 768;
    }
    return true;
  });
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Browser State
  const [currentUrl, setCurrentUrl] = useState<string>('/welcome');
  const [historyStack, setHistoryStack] = useState<string[]>(['/welcome']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  
  // Agent State
  // We use a unique ID for the current conversation thread
  const [currentThreadId, setCurrentThreadId] = useState<string>(`thread-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'init',
        sender: 'agent',
        text: 'Hello! I am LetEX, your context-aware AI Agent. Ask me anything, or ask me about the page you are viewing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [pageContent, setPageContent] = useState<string>('');
  
  // Data State
  const [threads, setThreads] = useState<Thread[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // --- Persistence Effect ---
  useEffect(() => {
    // Save browser state to survive refreshes
    localStorage.setItem('currentUrl', currentUrl);
    localStorage.setItem('historyStack', JSON.stringify(historyStack));
    localStorage.setItem('historyIndex', historyIndex.toString());
    localStorage.setItem('isSidebarOpen', JSON.stringify(isSidebarOpen));
  }, [currentUrl, historyStack, historyIndex, isSidebarOpen]);

  useEffect(() => {
    // Restore state on mount
    const savedUrl = localStorage.getItem('currentUrl');
    const savedStack = localStorage.getItem('historyStack');
    const savedIndex = localStorage.getItem('historyIndex');

    if (savedUrl && savedUrl !== '/welcome') {
      setCurrentUrl(savedUrl);
      setIsError(isLikelyToBlock(savedUrl));
    }
    if (savedStack) setHistoryStack(JSON.parse(savedStack));
    if (savedIndex) setHistoryIndex(parseInt(savedIndex));
  }, []);

  // --- Auth & Data Loading Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
        
        // Load User Data
        const userThreads = await getUserThreads(firebaseUser.uid);
        const userNotes = await getUserNotes(firebaseUser.uid);
        setThreads(userThreads);
        setNotes(userNotes);

      } else {
        setUser(null);
        setThreads([]);
        setNotes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Auto-Save Thread Effect ---
  useEffect(() => {
    if (user && messages.length > 1) { // Only save if there's actual conversation
        // Debounce or simple logic: Save every time messages change for this prototype
        const title = messages.find(m => m.sender === 'user')?.text.substring(0, 40) + "..." || "New Conversation";
        
        saveThread(user.uid, currentThreadId, title, messages).then(() => {
            // Optimistically update threads list if it's new
            setThreads(prev => {
                const existing = prev.findIndex(t => t.id === currentThreadId);
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = { ...updated[existing], messages, updatedAt: Date.now() };
                    return updated.sort((a,b) => b.updatedAt - a.updatedAt);
                } else {
                    return [{
                        id: currentThreadId,
                        userId: user.uid,
                        title,
                        messages,
                        updatedAt: Date.now()
                    }, ...prev];
                }
            });
        });
    }
  }, [messages, user, currentThreadId]);

  // Refresh Notes list occasionally or after tool usage
  const refreshNotes = async () => {
      if (user) {
          const freshNotes = await getUserNotes(user.uid);
          setNotes(freshNotes);
      }
  };


  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      // Reset Chat
      handleNewChat();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleNewChat = () => {
      setCurrentThreadId(`thread-${Date.now()}`);
      setMessages([{
        id: 'init',
        sender: 'agent',
        text: 'Hello! I am LetEX, your context-aware AI Agent. Ask me anything, or ask me about the page you are viewing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
  };

  const handleSelectThread = (thread: Thread) => {
      setCurrentThreadId(thread.id);
      setMessages(thread.messages);
  };

  // --- Logic ---

  // Attempt to extract content from iframe
  const extractContent = () => {
    try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
             // This will throw a SecurityError for Cross-Origin frames
            const text = iframeRef.current.contentWindow.document.body.innerText;
            if (text && text.length > 50) {
                setPageContent(text.substring(0, 5000)); // Limit context size
                return;
            }
        }
    } catch (e) {
        // Expected behavior for most sites
        console.log("Cross-origin restriction: Cannot read iframe content.");
    }
    
    // Fallback if blocked or empty
    if (currentUrl !== '/welcome') {
        setPageContent(`Context extraction failed due to browser security restrictions (CORS/X-Frame-Options) for ${currentUrl}. I will use Google Search instead.`);
    } else {
        setPageContent("User is on the welcome screen.");
    }
  };

  const handleSendMessage = async (text: string) => {
    // Auth Check for Chat
    if (!user) {
        setIsSidebarOpen(true); // Open to show the "Please sign in" message
        return;
    }

    // Optimistic Update
    const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: text,
        timestamp: new Date().toLocaleTimeString()
    };
    
    const loadingId = 'loading-' + Date.now();
    const loadingMsg: Message = {
        id: loadingId,
        sender: 'agent',
        text: '',
        timestamp: new Date().toLocaleTimeString(),
        isLoading: true
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setIsSidebarOpen(true); // Open sidebar to show chat

    // Callback for when a Tool is triggered (Visual Feedback)
    const onToolStart = (name: string, args: any) => {
        // If note tool is used, we know data changed on backend, so generic refresh
        if (name === 'add_to_notes') {
            setTimeout(refreshNotes, 2000); // Small delay for firestore propagation
        }

        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== loadingId);
            return [
                ...filtered,
                {
                    id: `tool-${Date.now()}`,
                    sender: 'agent',
                    text: '',
                    timestamp: new Date().toLocaleTimeString(),
                    toolCall: { name, args }
                },
                loadingMsg // Re-add loading spinner for the final text generation
            ];
        });
    };

    // Call API, passing userId for DB operations
    const responseText = await sendMessageToGemini(messages, text, pageContent, onToolStart, user.uid);

    // Replace the specific loading message with the final text
    setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
        ? { ...msg, text: responseText, isLoading: false } 
        : msg
    ));
  };

  const handleCommand = (input: string) => {
    // 1. Check if it's a URL or explicit navigation
    if (isValidUrl(input)) {
        handleNavigate(input);
    } else {
        // 2. Otherwise treat as chat
        handleSendMessage(input);
    }
  };

  const handleNavigate = (input: string) => {
    let newUrl = processUrlInput(input);
    
    // Try to optimize for embedding (e.g. YouTube -> embed)
    newUrl = transformUrlForEmbed(newUrl);

    setIsLoading(true);
    setIsError(false);
    setPageContent(''); // Clear old context
    
    // Check for simulated security blocks immediately
    if (isLikelyToBlock(newUrl)) {
      setIsError(true);
      setIsLoading(false);
      setPageContent(`Context unavailable. The application automatically blocked ${newUrl} to prevent display errors.`);
    }

    // Update History
    const newHistory = historyStack.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistoryStack(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(newUrl);
  };

  const handleGoHome = () => {
    setIsLoading(false);
    setIsError(false);
    setPageContent('User is on the welcome screen.');
    const newUrl = '/welcome';
    
    // Add to history if we want Home to be a history state
    const newHistory = historyStack.slice(0, historyIndex + 1);
    newHistory.push(newUrl);
    setHistoryStack(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentUrl(newUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevUrl = historyStack[prevIndex];
      setHistoryIndex(prevIndex);
      setCurrentUrl(prevUrl);
      setIsError(isLikelyToBlock(prevUrl));
      if (prevUrl !== '/welcome') setIsLoading(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextUrl = historyStack[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentUrl(nextUrl);
       setIsError(isLikelyToBlock(nextUrl));
       if (nextUrl !== '/welcome') setIsLoading(true);
    }
  };

  const handleRefresh = () => {
    if (currentUrl !== '/welcome') {
      setIsLoading(true);
      const url = currentUrl;
      setCurrentUrl('');
      setTimeout(() => setCurrentUrl(url), 10);
    }
  };

  const handleFrameLoad = () => {
    setIsLoading(false);
    // Attempt extraction after load
    setTimeout(extractContent, 500);
  };

  const handleSummarize = () => {
      handleSendMessage("Provide a 4-point, bulleted summary of the content in the current context.");
  };

  const handleReaderMode = () => {
      // Trigger the agent to read/search the current URL since iframe is blocked
      handleSendMessage(`Please read and summarize the content of this URL: ${currentUrl}. It cannot be displayed in the iframe due to security restrictions.`);
  };

  const handleManualBlock = () => {
      setIsError(true);
      setPageContent(`Context unavailable. The user reported that ${currentUrl} could not be displayed.`);
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      
      {/* Central Viewport */}
      <MainViewport 
        sidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        currentUrl={currentUrl}
        isLoading={isLoading}
        isError={isError}
        onFrameLoad={handleFrameLoad}
        onNavigateBack={handleBack}
        onNavigateForward={handleForward}
        onNavigateHome={handleGoHome}
        onNavigate={handleNavigate}
        onRefresh={handleRefresh}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < historyStack.length - 1}
        iframeRef={iframeRef}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onReaderMode={handleReaderMode}
        onReportIssue={handleManualBlock}
      />

      {/* Floating Command Bar */}
      <CommandBar 
        onSubmit={handleCommand} 
        isLoading={isLoading}
        currentUrl={currentUrl}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Right Sidebar Agent */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        messages={messages}
        onSummarize={handleSummarize}
        user={user}
        threads={threads}
        notes={notes}
        onSelectThread={handleSelectThread}
        activeThreadId={currentThreadId}
        onNewChat={handleNewChat}
      />
      
      {/* Mobile Overlay for Sidebar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

    </div>
  );
};

export default App;
