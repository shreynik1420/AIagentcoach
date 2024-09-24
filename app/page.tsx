"use client";
import { useEffect, useState } from "react";
import { Page } from "@/components/page";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import useTheme from "@/app/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ChatPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Theme management

  // Detect if the user is on a mobile device
  useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const isMobileDevice = /Mobi|Android|iPhone/i.test(userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  // Redirect signed-out users immediately
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/signin");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <>
      <SignedIn>
        <Page />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
          <div className="text-center transition-opacity duration-500 ease-in-out">
            <h2 className="text-2xl font-semibold mb-4 animate-pulse opacity-90">Redirecting to aicoach...</h2>
            <p className="text-gray-300">Please wait...</p>
          </div>
        </div>
      </SignedOut>
    </>
  );
};

export default ChatPage;
