import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1e1e1e] relative overflow-hidden min-h-dvh md:min-h-0">
      
      <div className="w-auto mx-auto px-6 pt-10 md:px-0 md:py-12 relative z-10">
        
        <div className="flex flex-col md:grid md:grid-cols-[2fr_1fr] justify-between">
          
          {/* Left Column: Branding and Contact */}
          <div className="md:pl-10">
            
            {/* Logo Section */}
            <div className="flex items-center mb-6 md:mb-2 md:ml-32 relative z-10">
              <img
                src="/footer_assets/cict-small-icon.svg" 
                className="w-14 h-14 md:w-18 md:h-18 md:mr-0"
                alt="WVSU CICT Logo"
              />
              <h2 className="text-4xl md:text-5xl font-medium uppercase leading-4 flex gap-3 text-white">
                WVSU <span className="font-light font-major">CICT</span> 
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-left font-minor text-white md:max-w-170 md:ml-35 mb-12 md:mb-18 leading-6 relative z-10">
              The official website of the <span className="text-orange-light font-minor">WVSU College of Information and Communications Technology. </span>
              We aim to foster a resilient, innovative, and digitally-ready Western Visayas - producing competent, globally competitive, and technologically skilled harbingers of change.
            </p>

            {/* Social Media Section */}
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-normal mb-2 md:mb-4 md:ml-35 text-white tracking-wide">
                Get in touch with <span className="text-orange-light font-major">us</span>
              </h3>
              
              {/* Added gap for mobile spacing */}
              <div className="flex md:ml-33 gap-2 md:gap-0 items-center">
                <a href="https://web.facebook.com/cictwvsu" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                  <img
                    src="/footer_assets/footer-fb.svg" 
                    className="w-5 h-6 md:w-7 md:h-5 object-contain"
                    alt="Facebook"
                  />
                </a>
                <a href="mailto:cict@wvsu.edu.ph" className="text-gray-300 hover:text-white transition-colors duration-200">
                  <img
                    src="/footer_assets/footer-mail.svg" 
                    className="w-8 h-8 md:w-10 md:h-7 object-contain brightness-0 invert pt-1"
                    alt="Email"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile SVG Background */}
          <div className="absolute -left-10 top-60 opacity-60 pointer-events-none z-0">
            <img 
              src="/footer_assets/cict-icon-mobile.svg" 
              alt="" 
              className="block md:hidden w-130 h-125" 
            />
          </div>

          {/* Desktop SVG Background */}
          <div className="absolute mt-10 right-10 top-1/2 -translate-y-1/2 translate-x-10 opacity-60 pointer-events-none z-0">
            <img 
              src="/footer_assets/cict-big-icon.svg" 
              alt="" 
              className="hidden md:block w-180 h-170 object-contain" 
            />
          </div>

          {/* Right Column: Navigation */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right pt-12 md:pt-18 pr-0 md:pr-44 relative z-10">
            <p className="text-base md:text-2xl font-extrabold font-minor mb-4 tracking-tight text-white">NAVIGATION</p>
            <nav className="flex flex-col items-start md:items-end gap-5 md:gap-4 text-sm md:text-xl">
              <Link href="/programs" className="text-white hover:text-gray-300 transition-colors uppercase tracking-wide">
                PROGRAM
              </Link>
              <Link href="/news-announcements" className="text-white hover:text-gray-300 transition-colors uppercase tracking-wide">
                NEWS
              </Link>
              <Link href="/faculty-profiles" className="text-white hover:text-gray-300 transition-colors uppercase tracking-wide">
                FACULTY
              </Link>
              <Link href="/contact" className="text-white hover:text-gray-300 transition-colors uppercase tracking-wide">
                CONTACT
              </Link>
            </nav>
          </div>

          {/* Bottom Copyright Divider */}
          {/* Stretches full width on mobile, centers text */}
          <div className="mt-10 md:mt-15 md:mb-20 w-full md:col-span-2 relative z-10">
            <div className="h-px w-screen -ml-6 md:ml-0 md:w-291 md:translate-x-45 justify-center bg-[#4D4D4D] mb-5 md:mb-4"></div>
            <p className="text-sm md:text-base font-medium text-center md:text-left text-white md:translate-x-55">
              Copyright 2026 © WVSU CICT. All Rights Reserved
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}