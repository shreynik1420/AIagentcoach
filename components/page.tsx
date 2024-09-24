"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import styles from "./overall.module.css"
import { FaArrowRight } from "react-icons/fa6";
import {
  ExternalLink,
  HelpCircle,
  MessageCircle,
  MoreHorizontal,
  ArrowRight,
  BookCheck,
  TargetIcon
} from "lucide-react";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import 'react-toastify/dist/ReactToastify.css';
import ChatSidebar from "@/components/chatSideBar";
import HeaderBar from "@/components/header";
import TopicIntroduction from "@/components/topicIntroduction";
import SpeechToText from "@/components/speechToText";
import { cn } from "@/lib/utils";
import IntroductionModal from '@/components/IntroductionModal'

type ExpertType = 'General' | 'Real Estate' | 'Sales' | 'Marketing' | 'Negotiation' | 'Motivation';

export function Page() {
  const [inputValue, setInputValue] = useState("");
  const [currentExpert, setCurrentExpert] = useState<ExpertType>("General");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useClerk();
  const supabaseUrl = "https://cfkdwcrvjjpprhbmzzxz.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(true)

  useEffect(() => {
    const expertType = searchParams.get('expertType');
    if (expertType ) {
      console.log(expertType)
      setCurrentExpert(expertType as ExpertType);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollHeight = scrollAreaRef.current.scrollHeight;
      scrollAreaRef.current.scrollTop = scrollHeight * 0.2; 
    }
  }, [currentExpert]);

  useEffect(() => {
    async function fetchUserDetails() {
      if (isLoaded && isSignedIn) {
        const { data: user, error } = await supabase
          .from("user")
          .select("user_id")
          .eq("user_id", userId);

        if (Boolean(user) && user !== null && user.length === 0) {
          const { data, error } = await supabase
            .from("user")
            .insert([{ user_id: userId }])
            .select();
        }
      }
    }
    fetchUserDetails();
  }, [isLoaded, isSignedIn, supabase, userId]);

  const handleSendMessage = async (message: string) => {
    if (message.trim()) {
      try {
        const chatId = uuidv4();
        const { data, error } = await supabase
          .from("chat")
          .insert([
            { chat_id: chatId, user_id: userId, coach_type: currentExpert },
          ])
          .select();
         
        router.push(`/chat/${chatId}?ques=${message}&new=true`);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
    setInputValue("");
  };

  const handleExpertClick = (expert: ExpertType) => {
    setCurrentExpert(expert);
    setIsSidebarOpen(false);
  };

  const handleAskQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleTranscription = (transcribedText: string) => {
    setInputValue((prev) => `${prev} ${transcribedText}`);
  };

  function handleActionClick(action: string): void {
    switch (action) {
      case 'examples':
        // Handle examples action
        break;
      case 'specific':
        // Handle specific action
        break;
      case 'understand':
        // Handle understand action
        break;
      case 'continue':
        // Handle continue action
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  const closeIntroModal = () => {
    setIsIntroModalOpen(false);
  };

  return (
    <div
  className={`flex flex-col h-screen text-white dark:bg-[rgba(213,227,255,1)] ${styles.mobilebg} bg-gradient-to-t from-[rgba(15, 16, 35, 0.8)] to-[rgba(15, 16, 35, 0.8)] bg-black`}
>
<div
  className="absolute top-[-150px] left-[-220px] w-[450px] h-[559px] rotate-[-90deg] rounded-[559px] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(35,66,113,0.6)_0%,rgba(35,66,113,0)_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(148,184,255,0.60)_0%,rgba(110,151,232,0)_100%)]"
/>


{/* <div className={styles.overlay}/> */}

      <HeaderBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} signOut={signOut}/>

      {/* <div className="flex flex-1 overflow-hidden pt-16"> */}
      <div className={`flex flex-1 overflow-hidden ${styles.pt} bg-[linear-gradient(0deg,rgba(15,16,35,0.80)_0%,rgba(15,16,35,0.80)_100%),_#000] dark:bg-[linear-gradient(0deg,rgba(213,227,255,0.74)_0%,rgba(213,227,255,0.74)_100%),_#FFF]`}>
        <ChatSidebar userId={userId} supabase={supabase} isSidebarOpen={isSidebarOpen} handleExpertClick={handleExpertClick} />

        <div className="flex-1 flex flex-col  w-full bg-gradient-to-t from-[rgba(15, 16, 35, 0.80)] to-[rgba(15, 16, 35, 0.80)]">

        {/* dark:bg-[rgba(213,227,255,0.74)] */}
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4 min-h-[calc(100vh-12rem)]" >
              <div className="pt-2">
                <TopicIntroduction
                  topic={currentExpert}
                  onAskQuestion={handleAskQuestion}
                />
              </div>
            </div>
          </ScrollArea>

          <div className=" p-4">
            
            {/* <div className="action-buttons flex justify-center space-x-4 mb-5">
              <button 
                onClick={() => handleActionClick('examples')}
                className="bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md text-sm hover:bg-gray-600 hover:text-white transition-colors duration-200 flex items-center space-x-1.5 relative group"
                title="Request specific examples related to the topic"
              >
                <BookCheck className="h-3.5 w-3.5" />
                <span>Give me examples</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 whitespace-nowrap">
                  Request specific examples
                </div>
              </button>
              <button 
                onClick={() => handleActionClick('specific')}
                className="bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md text-sm hover:bg-gray-600 hover:text-white transition-colors duration-200 flex items-center space-x-1.5 relative group"
                title="Ask for more detailed information"
              >
                <TargetIcon className="h-3.5 w-3.5" />
                <span>Be more specific</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 whitespace-nowrap">
                  Ask for more details
                </div>
              </button>
              <button 
                onClick={() => handleActionClick('understand')}
                className="bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md text-sm hover:bg-gray-600 hover:text-white transition-colors duration-200 flex items-center space-x-1.5 relative group"
                title="Request clarification on the topic"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>I don't understand</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 whitespace-nowrap">
                  Request clarification
                </div>
              </button>
              <button 
                onClick={() => handleActionClick('continue')}
                className="bg-gray-700 text-gray-200 px-2.5 py-1 rounded-md text-sm hover:bg-gray-600 hover:text-white transition-colors duration-200 flex items-center space-x-1.5 relative group"
                title="Continue the current conversation"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Continue</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 whitespace-nowrap">
                  Continue conversation
                </div>
              </button>
            </div> */}



            <form onSubmit={handleFormSubmit} className="relative flex items-center w-full">
              <div className={styles.main}>


{/* <Input
  className="flex-1 bg-gray-200 text-white border border-[#2F76FF]-700 dark:border-[#000000] placeholder:text-[#C6C6C6] focus:outline-none pr-28 pl-6 dark:bg-gray-800 dark:text-[#6E97E8] dark:placeholder:text-[#6E97E8]" // Use dark: modifier for dark mode
  placeholder={`Ask me any question about ${currentExpert.toLowerCase()}! Just type or use the microphone.`}
  
  style={{
    borderRadius: '80px',
    border: '0.5px solid #2F76FF',
    background: 'linear-gradient(0deg, rgba(121, 166, 255, 0.16) 0%, rgba(47, 118, 255, 0.16) 100%)',
    WebkitBackdropFilter: 'blur(20px)',
    backdropFilter: 'blur(20px)',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 300,
  }}
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/> */}

<Input
  className={`flex-1 bg-gray-200 text-white border border-[#2F76FF] focus:outline-none pr-28 pl-6 
              dark:bg-gray-800 dark:text-[#ffffff] dark:border-[#000000] 
              placeholder:text-[#ffffff] dark:placeholder:text-[#6E97E8]`}
              placeholder={`Ask me any question about ${currentExpert.toLowerCase()}! Just type or use the microphone.`}

  style={{
    borderRadius: '80px',
    border: '0.5px solid #2F76FF',
    background: 'linear-gradient(0deg, rgba(121, 166, 255, 0.16) 0%, rgba(47, 118, 255, 0.16) 100%)',
    WebkitBackdropFilter: 'blur(20px)',
    backdropFilter: 'blur(20px)',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 300,

  }}
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>


  <div  className={styles.con}>
    <SpeechToText onTranscribe={handleTranscription} />
    <button
      type="submit"
      className={styles.subarr}>
        <FaArrowRight fill="#2F76FF" className={styles.arrr} size={25}/>
    </button>
  </div>
  
  </div>
</form>
<p className="text-xs text-gray-500 mt-9 text-center">
              © 2024 AgentCoach.ai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      {isIntroModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}
      <IntroductionModal isOpen={isIntroModalOpen} onClose={closeIntroModal} />
    </div>
  );
}