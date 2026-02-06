"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Echo</h1>
          <p className="text-purple-200/70">
            Create your memory companion account
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-purple-200/70",
              socialButtonsBlockButton:
                "bg-white/10 border border-white/20 text-white hover:bg-white/20",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-white/20",
              dividerText: "text-purple-200/70",
              formFieldLabel: "text-purple-200",
              formFieldInput:
                "bg-white/10 border-white/20 text-white placeholder:text-purple-200/50",
              formButtonPrimary:
                "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
              footerActionLink: "text-purple-300 hover:text-purple-200",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-purple-300",
            },
          }}
        />
      </div>
    </div>
  );
}
