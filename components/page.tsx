'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageCircle,
  Share,
  ThumbsDown,
  ThumbsUp,
  Handshake,
  TrendingUp,
  Zap,
  LogOut,
  Settings,
  HelpCircle,
  BarChart,
  FileText,
  Target,
  Brain,
  Mic,
  Menu,
  Megaphone,
  Home,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ExpertType = 'General' | 'Real Estate' | 'Sales' | 'Marketing' | 'Negotiation' | 'Motivation';

const TopicIntroduction: React.FC<{ topic: ExpertType; onAskQuestion: (question: string) => void }> = ({
  topic,
  onAskQuestion,
}) => {
  const topicData = {
    General: {
      icon: <Brain className="w-12 h-12 md:w-16 md:h-16" />,
      description: 'Your personal AI Coach for various aspects of professional and personal development.',
      questions: [
        { icon: <HelpCircle />, text: 'How can AI real estate coaching benefit me?' },
        { icon: <Target />, text: 'What areas can you assist me with?' },
        { icon: <MessageCircle />, text: 'How do I get started with AI real-estate coaching?' },
        { icon: <FileText />, text: 'Can you explain your coaching methodology?' },
      ],
    },
    'Real Estate': {
      icon: <Home className="w-12 h-12 md:w-16 md:h-16" />,
      description: 'Get expert advice on real estate industry insights and practices.',
      questions: [
        { icon: <HelpCircle />, text: 'What are the current trends in the real estate market?' },
        { icon: <MessageCircle />, text: 'How can I improve my real estate investment strategies?' },
        { icon: <Target />, text: 'What are some tips for first-time home buyers?' },
        { icon: <FileText />, text: 'How does location affect property value?' },
      ],
    },
    Sales: {
      icon: <TrendingUp className="w-12 h-12 md:w-16 md:h-16" />,
      description: 'Boost your sales performance with expert strategies and techniques.',
      questions: [
        { icon: <HelpCircle />, text: 'What are the key elements of a successful real estate sales pitch?' },
        { icon: <MessageCircle />, text: 'How can I improve my cold calling skills?' },
        { icon: <Target />, text: 'What are effective closing techniques in real estate sales?' },
        { icon: <BarChart />, text: 'How to analyze and improve sales metrics?' },
      ],
    },
    Marketing: {
      icon: <Megaphone className="w-12 h-12 md:w-16 md:h-16" />,
      description: 'Enhance your marketing strategies and communication skills in real estate.',
      questions: [
        { icon: <HelpCircle />, text: 'What are effective marketing strategies for real estate agents?' },
        { icon: <MessageCircle />, text: 'How can I improve my communication with clients?' },
        { icon: <Target />, text: 'What role does social media play in real estate marketing?' },
        { icon: <FileText />, text: 'Can you suggest ways to improve my online presence?' },
      ],
    },
    Negotiation: {
      icon: <Handshake className="w-12 h-12 md:w-16 md:h-16" />,
      description: 'Master the art of win-win outcomes and effective communication.',
      questions: [
        { icon: <HelpCircle />, text: 'What are some common mistakes to avoid during real estate negotiations?' },
        { icon: <MessageCircle />, text: 'What are some effective negotiation techniques?' },
        { icon: <Target />, text: 'How to negotiate with difficult personalities?' },
        { icon: <FileText />, text: 'How should I handle counteroffers from sellers or buyers?' },
      ],
    },
    Motivation: {
      icon: <Zap className="w-12 h-12 md:w-16 md:h-16" />,
      description: 'Unlock your potential with powerful motivation and goal-setting strategies.',
      questions: [
        { icon: <HelpCircle />, text: 'How can I stay motivated during a down-market in real estate?' },
        { icon: <Target />, text: 'What are some effective goal-setting techniques?' },
        { icon: <MessageCircle />, text: 'How to overcome procrastination and boost productivity?' },
        { icon: <FileText />, text: 'Can you suggest daily habits for maintaining motivation?' },
      ],
    },
  };

  const data = topicData[topic];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 max-w-2xl mx-auto mb-8 px-4">
      <div className="text-blue-400">{data.icon}</div>
      <h2 className="text-xl md:text-2xl font-bold text-white text-center">{topic}</h2>
      <p className="text-center text-gray-300 text-sm md:text-base">{data.description}</p>
      <p className="text-center text-gray-300 text-sm md:text-base">
        Click one of the sample questions below or type your own question!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {data.questions.map((question, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:bg-gray-800 bg-gray-900"
            onClick={() => onAskQuestion(question.text)}
          >
            <CardContent className="flex items-start p-4">
              <div className="mr-4 mt-1 text-blue-400">{question.icon}</div>
              <p className="text-sm text-gray-300">{question.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentExpert, setCurrentExpert] = useState<ExpertType>('General');
  const [isListening, setIsListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (message.trim()) {
      const userMessage: Message = { role: 'user', content: message };
      setMessages((prev) => [...prev, userMessage]);

      let chatbotParam = currentExpert.toLowerCase().replace(/\s+/g, '_');
      if (chatbotParam === 'general' || chatbotParam === 'negotiation') {
        chatbotParam = 'real_estate';
      }
      const expertParam = currentExpert.toLowerCase().replace(/\s+/g, '_');

      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            chatbot: chatbotParam,
            expert: expertParam,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let done = false;

        let assistantMessage: Message = { role: 'assistant', content: '' };
        setMessages((prev) => [...prev, assistantMessage]);
        const newMessages = [...messages, userMessage];
        let assistantMessageIndex = newMessages.length;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);

          assistantMessage.content += chunkValue;

          // Update the assistant message in the messages array
          setMessages([...newMessages, assistantMessage]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue('');
  };

  const handleExpertClick = (expert: ExpertType) => {
    setCurrentExpert(expert);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleAskQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      // Start voice recognition here
      // When voice input is received, set it to inputValue
      // setInputValue(voiceInput)
      // setIsListening(false)
    } else {
      setIsListening(false);
      // Stop voice recognition here
    }
  };

  const getAIAvatar = (expert: ExpertType) => {
    let IconComponent;
    switch (expert) {
      case 'General':
        return (
          <AvatarImage
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2%20copy-FNVfXcGRjKO97dR4JbmOnzv21Ov8LM.png"
            alt="AI"
          />
        );
      case 'Real Estate':
        IconComponent = Home;
        break;
      case 'Negotiation':
        IconComponent = Handshake;
        break;
      case 'Sales':
        IconComponent = TrendingUp;
        break;
      case 'Motivation':
        IconComponent = Zap;
        break;
      case 'Marketing':
        IconComponent = Megaphone;
        break;
      default:
        IconComponent = Brain;
    }
    return (
      <div className="w-full h-full rounded-full border-2 border-blue-400 flex items-center justify-center bg-gray-800">
        <IconComponent className="w-5 h-5 text-blue-400" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-700 md:hidden mr-2"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-LNqJvtMncHrGgssgeeVhV3hMJV8k6Z.png"
            alt="AgentCoach.ai Logo"
            className="h-8 md:h-12"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 md:hidden">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 md:hidden">
            <LogOut className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 hidden md:flex">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 hidden md:flex">
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } md:block fixed md:relative z-20 w-64 h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out overflow-y-auto`}
        >
          <Button
            variant="ghost"
            className="flex items-center justify-center h-16 w-full border-b border-gray-700 text-white hover:text-white hover:bg-gray-800"
            onClick={() => handleExpertClick('General')}
          >
            <Brain className="h-6 w-6 mr-2" />
            <span className="font-semibold">Your AI Coach</span>
          </Button>
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Chat with an AI expert in:</h3>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => handleExpertClick('Real Estate')}
            >
              <Home className="mr-2 h-4 w-4" />
              Real Estate
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => handleExpertClick('Sales')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Sales
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => handleExpertClick('Marketing')}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Marketing
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => handleExpertClick('Negotiation')}
            >
              <Handshake className="mr-2 h-4 w-4" />
              Negotiation
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => handleExpertClick('Motivation')}
            >
              <Zap className="mr-2 h-4 w-4" />
              Motivation
            </Button>
          </div>
        </div>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4 min-h-[calc(100vh-12rem)]">
              {messages.length === 0 ? (
                <div className="pt-8">
                  <TopicIntroduction topic={currentExpert} onAskQuestion={handleAskQuestion} />
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      {message.role === 'user' ? (
                        <AvatarImage
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7v1yfECIgEfyIYRs3CwfoJ3J8wagYT.png"
                          alt="User"
                          className="object-cover"
                        />
                      ) : (
                        getAIAvatar(currentExpert)
                      )}
                    </Avatar>
                    <div className="space-y-2 max-w-[70%] md:max-w-[80%]">
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {message.role === 'assistant' && !isLoading && (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleFormSubmit} className="flex space-x-2">
              <Input
                className="flex-1 bg-gray-800 text-white border-gray-700 focus:border-blue-400 h-12 px-4"
                placeholder={`Ask me any${
                  currentExpert === 'General' ? 'thing' : ` question about ${currentExpert.toLowerCase()}`
                }! Just type or use the microphone.`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />

              <Button
                type="button"
                size="icon"
                onClick={toggleListening}
                className="bg-gray-800 text-gray-300 hover:text-white"
                disabled={isLoading}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">© 2024 AgentCoach.ai. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
