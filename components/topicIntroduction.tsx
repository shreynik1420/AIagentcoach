"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

import {
  MessageCircle,
  Handshake,
  TrendingUp,
  Zap,
  HelpCircle,
  BarChart,
  FileText,
  Target,
  Brain,
  Megaphone,
  Home,
} from "lucide-react";

type ExpertType = 'General' | 'Real Estate' | 'Sales' | 'Marketing' | 'Negotiation' | 'Motivation';

const TopicIntroduction: React.FC<{
   topic: ExpertType;
   onAskQuestion: (question: string) => void;
 }> = ({ topic, onAskQuestion }) => {
   const topicData = {
     General: {
       icon: <Brain className="w-14 h-14 md:w-18 md:h-18" />,
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
         { icon: <HelpCircle />, text: 'Could you prepare a Competitive Market Analysis for my upcoming listing appointment?' },
         { icon: <MessageCircle />, text: 'Could you develop a business plan to help scale my real estate business?' },
         { icon: <Target />, text: 'What is an effective weekly schedule for balancing listings, showings, and client meetings?' },
         { icon: <FileText />, text: 'Could you provide a telephone script for cold calling expired listings?' },
       ],
     },
     Sales: {
       icon: <TrendingUp className="w-12 h-12 md:w-16 md:h-16" />,
       description: 'Boost your sales performance with expert strategies and techniques.',
       questions: [
         { icon: <HelpCircle />, text: 'How can I generate more leads online?' },
         { icon: <MessageCircle />, text: 'What are the top ten strategies used by the most successful salespeople?' },
         { icon: <Target />, text: 'What are the best open ended questions that will get prospects talking?' },
         { icon: <BarChart />, text: 'How do I use a closed ended sales question?' },
       ],
     },
     Marketing: {
       icon: <Megaphone className="w-12 h-12 md:w-16 md:h-16" />,
       description: 'Enhance your marketing strategies and communication skills in real estate.',
       questions: [
         { icon: <HelpCircle />, text: 'Can you write a BLOG article for first-time home buyers?' },
         { icon: <MessageCircle />, text: 'Can you write 4 Facebook ads to attract home sellers?' },
         { icon: <Target />, text: 'Can you create a marketing schedule with specific activities?' },
         { icon: <FileText />, text: 'What are the best posts to post on Instagram to generate business?' },
       ],
     },
     Negotiation: {
       icon: <Handshake className="w-12 h-12 md:w-16 md:h-16" />,
       description: 'Master the art of win-win outcomes and effective communication.',
       questions: [
         { icon: <HelpCircle />, text: "Could you offer a specific response for a negotiation I'm currently involved in?" },
         { icon: <MessageCircle />, text: 'What are some example strategies to use with a home seller who is undecided?' },
         { icon: <Target />, text: 'How can I effectively respond to objections regarding my real estate commission?' },
         { icon: <FileText />, text: 'How can I negotiate a lower commission split with my broker, given my performance?' },
       ],
     },
     Motivation: {
       icon: <Zap className="w-12 h-12 md:w-16 md:h-16" />,
       description: 'Unlock your potential with powerful motivation and goal-setting strategies.',
       questions: [
         { icon: <HelpCircle />, text: 'What strategies can I use to stay motivated and encouraged?' },
         { icon: <Target />, text: 'How do I know if this career is right for me when I\'m losing confidence?' },
         { icon: <MessageCircle />, text: 'What is the Law of Attraction, and how can I apply it in my life?' },
         { icon: <FileText />, text: 'What are some tips for creating more balance and joy in my life?' },
       ],
     },
   };

   const data = topicData[topic];

   return (
     <div className="flex flex-col items-center justify-center space-y-5 max-w-2xl mx-auto mb-7 px-4">
       <div className="text-blue-400">{data.icon}</div>
       <h2 className="text-xl font-bold text-white text-center">{topic}</h2>
       <p className="text-center text-gray-300 text-sm">{data.description}</p>
       <p className="text-center text-gray-300 text-sm">
         Click one of the sample questions below or type your own question!
       </p>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
         {data.questions.map((question, index) => (
           <Card
             key={index}
             className="cursor-pointer hover:bg-gray-800 bg-gray-900"
             onClick={() => onAskQuestion(question.text)}
           >
             <CardContent className="flex items-start p-4">
               <div className="mr-3 mt-1 text-blue-400">{question.icon}</div>
               <p className="text-sm text-gray-300">{question.text}</p>
             </CardContent>
           </Card>
         ))}
       </div>
     </div>
   );
};

export default TopicIntroduction;