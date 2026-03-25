// app/(auth)/layout.tsx

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // NO repetir <html> ni <body> aquí
    <div className="min-h-screen bg-[#0f1115]">
      {children}
    </div>
  );
}