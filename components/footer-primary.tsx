'use client'
import { useState } from "react"
import React from 'react'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js'
import { useToast } from "@/components/ui/use-toast"
import { CoolMode } from "@/components/magicui/cool-mode";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const AnimatedUnderline = ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
  <a 
    href={href} 
    className={`${className} relative overflow-hidden group`}
  >
    {children}
    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
  </a>
);

export default function FooterPrimary() {
  const [email, setEmail] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('user_email_list')
        .insert([{ email }])
      
      if (error) throw error

      toast({
        title: "Subscribed! 🎉",
        description: "Thank you for subscribing! You will get notified when new teaching jobs are posted.",
      })
      setEmail('')
    } catch (error) {
      console.error('Error inserting email:', error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <footer className="py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">For Teachers</h3>
            <ul className="space-y-2">
              <li>
                <AnimatedUnderline href="/jobs" className="text-primary">
                  Browse Jobs
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/signup" className="text-primary">
                  Create Profile
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/blog" className="text-primary">
                  Teaching Tips
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/#features" className="text-primary">
                  How It Works
                </AnimatedUnderline>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Countries</h3>
            <ul className="space-y-2">
              <li>
                <AnimatedUnderline href="/jobs?country=south-korea" className="text-primary">
                  South Korea
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/jobs?country=japan" className="text-primary">
                  Japan
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/jobs?country=china" className="text-primary">
                  China
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/jobs?country=thailand" className="text-primary">
                  Thailand
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/jobs?country=taiwan" className="text-primary">
                  Taiwan
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/jobs?country=vietnam" className="text-primary">
                  Vietnam
                </AnimatedUnderline>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <AnimatedUnderline href="/about" className="text-primary">
                  About Us
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/blog" className="text-primary">
                  Blog
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/contact" className="text-primary">
                  Contact
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/privacy" className="text-primary">
                  Privacy Policy
                </AnimatedUnderline>
              </li>
              <li>
                <AnimatedUnderline href="/terms" className="text-primary">
                  Terms of Service
                </AnimatedUnderline>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">
              Stay Updated
            </h3>
            <p className="text-primary mb-4">
              Get the latest ESL teaching jobs, tips, and resources delivered to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="flex">
              <div className="flex items-center w-full border border-gray-300 rounded-md focus-within:outline-none">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full text-sm relative z-20 border-none" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CoolMode>
                <Button type="submit" className="my-1 bg-black text-white rounded-md mr-1 ">
                    <ArrowRightIcon className="h-5 w-5" />
                </Button>
                </CoolMode>
              </div>
          </form>
          </div>
        </div>
        <div className="border-t mt-10 pt-6 flex flex-col items-center md:flex-row justify-between">
          <div className="flex items-center space-x-2">
            <LogInIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Curric.app</span>
          </div>
          <p className="text-gray-500 mt-4 md:mt-0">© Curric.app 2024. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function LogInIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}
