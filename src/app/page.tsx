import Link from "next/link";
import TestimonialCards from "../components/TestimonialCards";

export default function Home() {

  const button_big = "flex justify-center items-center border-1 rounded-2xl w-32 md:w-xs h-6 md:h-10 p-2";
  const card_small = "w-full shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-xl p-3 shadow-lg rounded-xl";
  const divider = "border border-transparent border-b-[#363636] p-2 md:p-4";
  const course_container = "w-25 h-24 md:w-58 md:h-54 flex flex-col justify-center items-center gap-2 md:gap-6 bg-white pt-3 md:pt-6";

  return (
    <main>
      {/*Landing Page*/}
      <section>
        {/*Header*/}
        <div className="mt-12 md:mt-36 text-[#373737] text-center gap-6">
          <h1 className="text-[32px] md:text-8xl font-medium leading-none md:leading-22">Building the <span className="text-orange-light">Digital<br/>Leaders</span> of Tomorrow</h1>
          <h2 className="text-[8px] md:text-2xl font-normal font-minor mt-1 md:mt-6">COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY</h2>
        </div>

        {/*Buttons*/}
        <div className="flex justify-center items-center mt-4 md:mt-16 gap-4 md:gap-20 text-center text-white text-[8px] md:text-base font-bold">
          <Link href="#courses-offered" className={` ${button_big} border-orange-light bg-orange-light hover:bg-white hover:text-orange-light transition-colors duration-200`}>COURSES OFFERED</Link>
          <Link href="#why-choose-us" className={` ${button_big} border-[#373737] bg-[#373737] hover:bg-white hover:text-[#373737] transition-colors duration-200`}>WHY CHOOSE US</Link>
        </div>

        {/*Tagline*/}
        <p className="mt-28 md:mt-44 font-major font-medium text-size-base md:text-2xl text-[#373737] text-center">We have been shaping <span className="text-orange-light">careers</span> for <br className="md:hidden" />technological trailblazers across <span className="text-orange-light">industries</span> for <br className="md:hidden" /><span className="text-orange-light">23 years</span>.</p>
      </section>

      {/*News and Announcements*/}
      <section className="flex flex-col justify-center items-center mx-4 md:mx-40 mt-10 md:mt-38 mb-16 max-w-full">
        {/*Top Section*/}
        <div className="grid grid-cols-2 w-full gap-6">
          <div className="w-full">
            <div className="flex items-center">
              <h1 className="text-[#585858] text-[11px] md:text-2xl font-medium flex">NEWS AND ANNOUNCEMENTS</h1>
              <Link href="/news-announcements" className="ml-auto flex justify-center items-center border h-3 md:h-8 w-14 md:w-32  border-[#4D4D4D] text-[#4D4D4D] transition duration-200 hover:bg-[#4D4D4D] hover:text-white text-[6px] md:text-xs rounded-full group">
                READ MORE
                <img 
                  src="/home-page_assets/grey-arrow-icon.png" 
                  className="ml-0.5 md:ml-2 w-[7px] md:w-4 h-[5px] md:h-3 transition duration-200 group-hover:invert group-hover:brightness-0"
                /> 
              </Link>
            </div>

            <h1 className="md:mt-6 text-[#373737] text-lg md:text-5xl font-medium">CHECK OUT THE LATEST <br/><span className="text-orange-light">COLLEGE UPDATES</span></h1>
            
            <p className="md:mt-1 text-[#828282] text-[8px] md:text-base font-normal">Stay informed with the latest updates, official announcements, and important notices</p>
          </div>

          {/*Featured Card*/}
          <div className="w-full h-52 hidden md:flex bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-lg">
            <img 
              src="/home-page_assets/featured-card-image.png" 
              alt="insert image here" 
              className="w-3xs mr-4" 
            />
            <div className="mt-4">
              <div className="flex items-center h-6">
                <p className="text-xs text-[#4D4D4D] font-normal">2 days ago |</p>
                <span className="ml-1.5 text-white text-[8px] font-bold bg-orange-light border-orange-light rounded-sm px-2">ANNOUNCEMENT</span>
              </div>
              <div className="ml-2 mt-6 flex flex-col h-36">
                <h1 className="text-xl font-bold mr-3 ">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
                <Link href="/news-announcements" className="ml-auto mt-auto mr-3 mb-3 flex justify-center items-center h-8 w-28 border border-orange-light rounded-full text-orange-light text-xs font-normal hover:bg-orange-light hover:text-white transition duration-200 group">
                  Read Now
                  <img 
                    src="/home-page_assets/orange-arrow-icon.png"  
                    className="ml-1.5 w-5 transition duration-200 group-hover:invert group-hover:brightness-0"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className={`${card_small} block md:hidden`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[6px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-17 h-3.5 flex justify-center items-center">ANNOUNCEMENT</span>
            </div>
            <div className="mt-1 flex flex-col h-20">
              <h1 className="text-sm font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <Link href="/news-announcements" className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal transition duration-200 hover:bg-orange-light hover:text-white group">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2 transition duration-200 group-hover:invert group-hover:brightness-0"
                />
              </Link>
            </div>
          </div>
        </div>
        
        {/*Bottom Section*/}
        <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 w-full gap-6">
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-1 md:mt-3 flex flex-col">
              <h1 className="text-sm md:text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <Link href="/news-announcements" className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal transition duration-200 hover:bg-orange-light hover:text-white group">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2 transition duration-200 group-hover:invert group-hover:brightness-0"
                />
              </Link>
            </div>
          </div>
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-1 md:mt-3 flex flex-col h-20">
              <h1 className="text-sm md:text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <Link href="/news-announcements" className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal transition duration-200 hover:bg-orange-light hover:text-white group">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2 transition duration-200 group-hover:invert group-hover:brightness-0"
                />
              </Link>
            </div>
          </div>
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-1 md:mt-3 flex flex-col h-20">
              <h1 className="text-sm md:text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <Link href="/news-announcements" className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal transition duration-200 hover:bg-orange-light hover:text-white group">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2 transition duration-200 group-hover:invert group-hover:brightness-0"
                />
              </Link>
            </div>
          </div>
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-1 md:mt-3 flex flex-col h-20">
              <h1 className="text-sm md:text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <Link href="/news-announcements" className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal transition duration-200 hover:bg-orange-light hover:text-white group">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2 transition duration-200 group-hover:invert group-hover:brightness-0"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="bg-[#1e1e1e] py-12 md:py-40 px-4 md:px-52 relative max-w-full">
        <img
          src="/home-page_assets/cict-logo.png"
          className="w-24 md:w-69 h-auto mx-auto md:float-right shrink-0 -mt-4 md:-mt-20"
        />
        <div>
          <h1 className="text-orange-light font-medium text-[32px] md:text-6xl my-1 md:my-4">ABOUT.</h1>
          <p className="text-white font-medium text-[10px] md:text-base leading-4 md:leading-8 w-4/5 md:w-160">Founded in <span className="text-orange-light font-bold">2002</span> under BOR Resolution No. 34, the College of Information and Communications Technology (CICT) began as the <span className="text-orange-light font-bold">Institute of Information and Communications Technology (IICT)</span> and launched the <span className="text-orange-light font-bold">BS in Information Technology (BSIT)</span> and <span className="text-orange-light font-bold">BS in Information Management (BSIM)</span> programs in AY 2002-2003, producing its first graduates soon after.</p>
        </div>

        <div className="ml-auto flex flex-col text-right mt-4">
          <h1 className="text-orange-light font-medium text-[32px] md:text-6xl my-1 md:my-4">MISSION.</h1>
          <p className="text-white font-medium text-[10px] md:text-base leading-4 md:leading-8 w-4/5 md:w-150 ml-auto">The WVSU-CICT aims to develop professionals who shall be able to meet the growing manpower  demand by expanding the ICT industries in the country. Being the lead institution of higher learning in <span className="text-orange-light font-bold">Western Visayas.</span></p>
        </div>

        <div className="mt-4">
          <h1 className="text-orange-light font-medium text-[32px] md:text-6xl my-1 md:my-4">VISION.</h1>
          <p className="text-white font-medium text-[10px] md:text-base leading-4 md:leading-8 w-4/5 md:w-150">To be the leading provider of ICT education in <span className="text-orange-light font-bold">Western Visayas</span>, aligned with the broader mandate of WVSU as the lead institution of higher learning in the region.</p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="mx-4 md:mx-40 my-8 md:my-20 scroll-mt-24">
        <h1 className="text-[#363636] font-medium text-[32px] md:text-[80px] mb-4 md:mb-2">Why Choose <span className="text-orange-light">Us</span>?</h1>
        <div className={` ${divider} flex items-center border-t-[#363636] `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-5 md:w-16 h-auto" />
          <p className="font-medium text-base md:text-5xl text-[#363636] ml-4">ACCREDITATIONS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-5 md:w-16 h-auto" />
          <p className="font-medium text-base md:text-5xl text-[#363636] ml-4">NATIONAL RANKINGS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-5 md:w-16 h-auto" />
          <p className="font-medium text-base md:text-5xl text-[#363636] ml-4">INTERNATIONAL RELATIONS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-5 md:w-16 h-auto" />
          <p className="font-medium text-base md:text-5xl text-[#363636] ml-4">COMPETITION RECOGNITIONS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-5 md:w-16 h-auto" />
          <p className="font-medium text-base md:text-5xl text-[#363636] ml-4">INTERNATIONAL ENGAGEMENTS</p>
        </div>
      </section>

      {/* Offered Programs Section */}
      <section id="courses-offered" className="mx-4 md:mx-40 my-8 md:my-20 scroll-mt-24">
        <h1 className="text-[#363636] font-medium text-2xl md:text-6xl text-right mb-12">INTERESTED IN THE COLLEGE? SEE WHAT <br className="hidden md:block" /><span className="text-orange-light font-bold">WE OFFER</span> IN THE TABLE</h1>
        <div className="w-full h-auto bg-[#F0F0F0] rounded-3xl md:rounded-[92px] flex flex-col">
          <div className="flex-1 flex justify-center items-center mt-4 mx-4 md:mt-16 md:mx-12">
            <h2 className="font-medium text-2xl md:text-6xl text-[#1E1E1E]">Offered Programs</h2>
            <Link href="/programs" className="ml-auto flex justify-center items-center border h-5 md:h-12 w-20 md:w-52 border-[#4D4D4D] text-[#4D4D4D] text-[10px] md:text-2xl font-medium rounded-full hover:bg-[#4D4D4D] hover:text-white transition duration-200 group">
              Explore All
              <img 
                src="/home-page_assets/grey-arrow-icon.png"
                className="w-3 md:w-6 h-auto ml-1 md:ml-4 transition duration-200 group-hover:invert group-hover:brightness-0"
              /> 
            </Link>
          </div>
          <div className="flex justify-center items-center py-8 md:py-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className={` ${course_container} `}>
                <img src="/home-page_assets/bsemc-icon.png" className="w-12 md:w-24 h-auto" />
                <h3 className="text-xs md:text-2xl font-medium text-[#1E1E1E]">BSEMC</h3>
              </div>
              <div className={` ${course_container} `}>
                <img src="/home-page_assets/bscs-icon.png" className="w-12 md:w-24 h-auto" />
                <h3 className="text-xs md:text-2xl font-medium text-[#1E1E1E]">BSCS</h3>
              </div>
              <div className={` ${course_container} `}>
                <img src="/home-page_assets/blis-icon.png" className="w-12 md:w-24 h-auto" />
                <h3 className="text-xs md:text-2xl font-medium text-[#1E1E1E]">BLIS</h3>
              </div>
              <div className={` ${course_container} `}>
                <img src="/home-page_assets/bsis-icon.png" className="w-12 md:w-24 h-auto" />
                <h3 className="text-xs md:text-2xl font-medium text-[#1E1E1E]">BSIS</h3>
              </div>
              <div className={` ${course_container} `}>
                <img src="/home-page_assets/bsit-icon.png" className="w-12 md:w-24 h-auto" />
                <h3 className="text-xs md:text-2xl font-medium text-[#1E1E1E]">BSIT</h3>
              </div>
              <div className={` ${course_container} `}>
                <img src="/home-page_assets/mit-icon.png" className="w-12 md:w-24 h-auto" />
                <h3 className="text-xs md:text-2xl font-medium text-[#1E1E1E]">MIT</h3>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial Cards Section */}
      <section className="flex flex-col bg-[#1E1E1E] md:py-12">
        <TestimonialCards />
      </section>

      {/* Contact Us Section */}
      <section className="flex flex-col justify-center items-center my-16 md:my-40 gap-6 md:gap-20">
        <h1 className="text-[#1E1E1E] font-medium text-2xl md:text-7xl leading-snug text-center"><span className="text-orange-light">Finding quality education is hard.</span><br/>We make it easy.</h1>
        <Link href="/contact" className="flex justify-center items-center text-orange-light text-center font-normal text-base md:text-3xl w-40 md:w-80 h-auto rounded-full border-2 md:border-3 border-orange-light hover:bg-orange-light hover:text-white transition duration-200 group">
          <span className="font-major m-2 md:m-4">CONTACT US</span>
          <img src="/home-page_assets/orange-arrow-icon.png" className="w-5 md:w-7 h-auto transition duration-200 group-hover:invert group-hover:brightness-0"/>
        </Link>
      </section>
    </main>
  );
}
