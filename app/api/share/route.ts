import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Resend } from 'resend';
import { clerkClient } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Implement this function to fetch user email using Clerk API
async function getUserEmail(userId: string): Promise<string> {
  const user = await clerkClient.users.getUser(userId);
  return user.emailAddresses[0].emailAddress;
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Fetch user email from Clerk API
    const userEmail = await getUserEmail(userId);

    // Send email using Resend
    try {
      await resend.emails.send({
        from: 'aiagentcoach@teamlumio.ai',
        to: userEmail,
        subject: 'Shared Message from AgentCoach.ai',
        html: content, // Now we're sending the formatted HTML content
      });
    } catch (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', email: userEmail });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
