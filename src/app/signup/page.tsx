"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.replace("/onboarding");
      }
    });
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/onboarding" });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Marketing */}
      <div className="hidden lg:flex lg:w-2/3 bg-white flex-col justify-center items-center px-12">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Automate Your Tasks With Saku AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Automate your ideas into reality fast & quick!
          </p>
          
          {/* Browser Illustration */}
          <div className="relative">
            <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-pink-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              
              {/* Integration Cards */}
              <div className="flex justify-end space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">*</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📁</span>
                </div>
              </div>
              
              {/* User Stats */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 mr-2">👥</span>
                  <span className="text-sm text-gray-600">Member • 16</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  48/57 Integrations • 3 Features
                </div>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 bg-pink-200 rounded-full"></div>
                  <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="w-full lg:w-1/3 bg-white flex flex-col justify-center px-8 py-12">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Get Started</h2>
          
          <div className="space-y-6">
            <p className="text-center text-sm text-gray-600 mb-6">
              Create your account with Google to get started
            </p>
            
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path bg="none" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path bg="none" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path bg="none" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path bg="none" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isLoading ? "Creating account..." : "Sign up with Google"}
            </button>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-black hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}