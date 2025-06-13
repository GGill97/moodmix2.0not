// //src/components/layout/PageLayout.tsx

// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// import { Music } from "lucide-react";

// export default function PageLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { data: session } = useSession();

//   return (
//     <div className="min-h-screen">
//       <header className="bg-white/10 backdrop-blur-md py-4 sticky top-0 z-10">
//         <div className="container mx-auto px-4 flex justify-between items-center">
//           <h1 className="text-2xl font-display text-soft-brown">MoodMix</h1>
//           {session ? (
//             <button
//               onClick={() => signOut()}
//               className="px-4 py-2 rounded-lg bg-terracotta/20 hover:bg-terracotta/30 transition-colors text-soft-brown"
//             >
//               Sign Out
//             </button>
//           ) : (
//             <button
//               onClick={() => signIn("spotify")}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta/20 hover:bg-terracotta/30 transition-colors text-soft-brown"
//             >
//               <Music className="w-4 h-4" />
//               <span>Connect Spotify</span>
//             </button>
//           )}
//         </div>
//       </header>

//       {children}
//     </div>
//   );
// }

"use client";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
