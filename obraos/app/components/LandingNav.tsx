"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

export function LandingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  // Evita el scroll del cuerpo cuando se abre el menú móvil
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <nav 
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isOpen ? "bg-transparent border-transparent" : "bg-[#09090b]/80 backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 relative z-50">
            <Link href="/">
              <Image 
                src="/obri.png" 
                alt="Obrit Logo" 
                width={100} 
                height={32} 
                className="h-8 w-auto object-contain relative z-50" 
                priority 
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="#product" className="hover:text-white transition-colors">Producto</Link>
            <Link href="#features" className="hover:text-white transition-colors">Soluciones</Link>
            <Link href="#resources" className="hover:text-white transition-colors">Recursos</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Precios</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/platform"
                  className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors shadow-lg"
                >
                  Ir al Portal
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-neutral-300 hover:text-white transition-colors ml-2"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[#ccff00] text-black hover:bg-[#b8e600] transition-colors shadow-lg"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-50 p-2 text-neutral-400 hover:text-white transition"
            aria-label="Alternar menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-[#09090b]/98 backdrop-blur-3xl z-40 md:hidden flex flex-col items-center justify-center transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-8 text-2xl font-semibold text-neutral-300 w-full px-6">
          <Link href="#product" onClick={() => setIsOpen(false)} className="hover:text-[#ccff00] transition-colors w-full text-center py-2">Producto</Link>
          <Link href="#features" onClick={() => setIsOpen(false)} className="hover:text-[#ccff00] transition-colors w-full text-center py-2">Soluciones</Link>
          <Link href="#resources" onClick={() => setIsOpen(false)} className="hover:text-[#ccff00] transition-colors w-full text-center py-2">Recursos</Link>
          <Link href="#pricing" onClick={() => setIsOpen(false)} className="hover:text-[#ccff00] transition-colors w-full text-center py-2">Precios</Link>
          
          {isLoggedIn ? (
            <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-xs">
              <Link
                href="/platform"
                onClick={() => setIsOpen(false)}
                className="w-full px-10 py-4 rounded-full bg-[#ccff00] text-black font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)] text-center text-lg"
              >
                Ir al Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-center py-3.5 text-neutral-300 hover:text-white transition-colors font-medium border border-white/10 rounded-full"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-xs">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3.5 text-neutral-300 hover:text-white transition-colors font-medium border border-white/10 rounded-full"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3.5 rounded-full bg-[#ccff00] text-black font-bold shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
