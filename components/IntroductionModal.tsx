'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

interface IntroductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntroductionModal({ isOpen, onClose }: IntroductionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) onClose(); // Call onClose when the dialog is closing
      }}>
      <DialogContent className="w-full max-w-[90%] md:max-w-md mx-auto rounded-lg p-6 shadow-xl" style={{
        background: 'linear-gradient(293.27deg, rgba(0, 3, 98, 0.8) 0.61%, rgba(7, 50, 63, 0.8) 99.39%), rgba(25, 53, 93, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Welcome to AgentCoach.ai!</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3 text-white">
          <p>
            You're currently in the General section, where you'll find essential guidance to help kickstart your journey.
          </p>
          <p>
            To begin, type or speak any question or request related to general knowledge in the search box below. Our AI will provide you with personalized advice instantly!
          </p>
          <p>
            If you're looking for more specialized help, explore the other sections: Real Estate, Sales, Marketing, Negotiation or Motivation, tailored to your needs.
          </p>
          <p className="font-semibold text-[#2f76ff]">
            The power of expert coaching is just a question away - start interacting now!
          </p>
        </div>
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="w-full mt-6 text-white bg-[#2f76ff] hover:bg-[#1e63e6]"
          >
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}