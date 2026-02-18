import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1e1e1e] relative overflow-hidden">
    
      <div className="w-auto mx-auto px-8 py-12 relative z-10">
        <div className="grid grid-cols-[2fr_1fr] justify-between">
          
          {/* Left Column: Branding and Contact */}
          <div>
            {/* Logo Section */}
            <div className="flex items-center mb-2 ml-32">
              {/* Logo SVG Placeholder */}
             <img
              src="/footer_assets/cict-small-icon.svg" 
              className="w-18 h-18"
              />
            
              <h2 className="text-5xl font-medium uppercase leading-4 flex gap-3 text-white">
                WVSU <span className="font-light font-major">CICT</span> 
              </h2>
            </div>

            {/* Description */}
            <p className="text-base text-left font-minor text-white max-w-170 ml-35 mb-18 leading-6">
              The official website of the <span className="text-orange-light font-minor">WVSU College of Information and Communications Technology. </span><br /> We aim to foster a resilient, innovative, and digitally-ready Western Visayas - producing competent, globally competitive, and technologically skilled harbingers of change.
            </p>

            {/* Social Media Section */}
            <div>
              <h3 className="text-2xl font-normal mb-4 ml-35 text-white tracking-wide">
                Get in touch with <span className="text-orange-light font-major">us</span>
              </h3>
              <div className="flex ml-33">
                {/* External links: Standard <a> tags are best practice here */}
                <a href="https://web.facebook.com/cictwvsu" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
              <img
              src="/footer_assets/footer-fb.svg" 
              className="w-7 h-5"
              />
                </a>
               
                <a href="mailto:cict@wvsu.edu.ph" className="text-gray-300 hover:text-white transition-colors duration-200">
              <img
              src="/footer_assets/footer-mail.svg" 
              className="w-10 h-6 brightness-0 invert"
              />
                </a>
              </div>
            </div>
          </div>

           {/* Right Column: Navigation */}
          <div className="absolute mt-10 right-10 top-1/2 -translate-y-1/2 translate-x-10 opacity-90 pointer-events-none z-0">
                <img 
                  src="/footer_assets/cict-big-icon.svg" 
                  alt="" 
                  className="w-170 h-150" 
                  />
          </div>
          <div className="flex flex-col items-end text-right mt-15 mr-40">
            <h1 className="text-2xl font-extrabold font-minor mb-6 tracking-tight text-white z-10">NAVIGATION</h1>
            <nav className="flex flex-col items-end gap-4 z-10">
              <Link href="/programs" className="text-white hover:text-white transition-colors uppercase text-xl tracking-wider">
                PROGRAM
              </Link>
              <Link href="/news-announcements" className="text-white hover:text-white transition-colors uppercase text-xl tracking-wider">
                NEWS
              </Link>
              <Link href="/faculty-profiles" className="text-white hover:text-white transition-colors uppercase text-xl tracking-wider">
                FACULTY
              </Link>
              <Link href="/contact" className="text-white hover:text-white transition-colors uppercase text-xl tracking-wider">
                CONTACT
              </Link>
            </nav>
          </div>
        </div>
       
      </div>
    </footer>
  );
}