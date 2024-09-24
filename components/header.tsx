"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Settings,
  Menu,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./overall.module.css"
import sun from "@/components/Assets/sun.svg"
import moon from "@/components/Assets/MoonStars.svg"
import lightlogo from "@/components/Assets/light-logo1.png"
import darklogo from "@/components/Assets/dark-logo3.png"
import useTheme from "@/app/hooks/useTheme";
// Removed UserPlus import
// Removed useState import
// Removed PersonalizeModal import

export default function HeaderBar({isSidebarOpen, setIsSidebarOpen, signOut}:any) {
  const { theme, toggleTheme } = useTheme(); // Use theme hook

  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-[rgb(17,30,62)] text-white dark:bg-[#879fcf]">
      <div className="flex items-center">
        <Button
          variant="navbtn"
          size="nav"
          className="  md:hidden mr-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-5 w-5 text-[#ffffff] dark:text-[#001c4f]" />
        </Button>
        <Link href="/"> 
        { theme === "light" ?
        <Image
          // src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-LNqJvtMncHrGgssgeeVhV3hMJV8k6Z.png"
          src={lightlogo}
          alt="AgentCoach.ai Logo"
          // className={`h-20 w-20 md:h-12 ${styles.logomain}`}
          className={`h-20 w-20 md:h-12 ${styles.logomain}`}

        /> 
: 
<Image
// src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-LNqJvtMncHrGgssgeeVhV3hMJV8k6Z.png"
src={darklogo}
alt="AgentCoach.ai Logo"
// className={`h-20 w-20 md:h-12 ${styles.logomain}`}
className={`h-20 w-20 md:h-12 ${styles.logomain}`}

/> 
      }
      
        </Link>
      </div>
      <div className="flex items-center md:space-x-5 space-x-0">
      {/* <LuSunDim size={35}/> */}
      {/* <Image src={sun} className={styles.mode} alt=" "/> */}
      <Button onClick={toggleTheme} variant="navbtn" size="nav" className={styles.pad}>
          {theme === "light" ? (
            <Image src={sun} className={styles.mode} alt="Sun Icon" />
          ) : (
            <Image src={moon} className={styles.mode} alt="Moon Icon" />
          )}
        </Button>
      <Button
  variant="navbtn" size="nav"
  className="font-100 text-white md:hidden ">
  <Settings className={`h-[28px] w-[28px] md:h-5 md:w-5 text-[#ffffff] dark:text-[#001c4f]  ${styles.pad}`} />
</Button>
<Button
  variant="navbtn" size="nav"
  className="font-100 text-white md:hidden">
 <LogOut className={`h-[28px] w-[28px] md:h-5 md:w-5 text-[#ffffff] dark:text-[#001c4f] ${styles.pad}`} />

</Button>

<Button
  variant="gradient"
  size="sm"
  className="hidden md:flex dark:text-[#001c4f] text-base  "
>
  <Settings className="h-7 w-7 mr-3  "  />
  Settings
</Button>

<Button
  onClick={() => signOut({ redirectUrl: "https://agentaicoach.vercel.app/" })}
  variant="gradient"
  size="sm"
  className="hidden md:flex dark:text-[#001c4f] text-base "
>
  <LogOut className="h-7 w-7 mr-3" />
  Logout
</Button>


      </div>
    </header>
  );
}

