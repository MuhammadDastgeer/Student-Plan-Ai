import { useRouter } from "./Router";

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-[#FAF8F5] border-t border-[#F0EBE5]/60 py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="w-7 h-7 rounded-md bg-[#c67f43] flex items-center justify-center shadow-xs">
            {/* Geometric custom SVG flower/star icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
            </svg>
          </div>
          <span className="font-sans font-bold text-lg text-[#221C18] tracking-tight">Flowbase</span>
        </div>

        {/* Middle Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-[#5E554E]">
          <button
            onClick={() => navigate("/home")}
            className="hover:text-[#c67f43] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/about")}
            className="hover:text-[#c67f43] transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => navigate("/price")}
            className="hover:text-[#c67f43] transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="hover:text-[#c67f43] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </div>

        {/* Right Side Copyright */}
        <div className="text-xs text-stone-500 font-medium">
          © 2026 Flowbase. All rights reserved.
        </div>

      </div>
    </footer>
  );
}

