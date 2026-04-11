export default function Home() {

  const button_big = "inline-block border-8 rounded-2xl w-xs h-10";
  const card_small = "w-3xs h-32 shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-xl p-3 w-3xs h-32 shadow-lg rounded-xl";
  const divider = "border border-transparent border-b-[#363636] p-4"

  return (
    <main>
      {/*Landing Page*/}
      <section>
        {/*Header*/}
        <div className="mt-36 text-[#373737] text-center gap-6">
          <h1 className="text-8xl font-medium leading-22">Building the <span className="text-orange-light">Digital<br/>Leaders</span> of Tomorrow</h1>
          <h2 className="text-2xl font-normal font-minor mt-6">COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY</h2>
        </div>

        {/*Buttons*/}
        <div className="flex justify-center items-center mt-16 gap-20 text-center text-white text-base font-bold">
          <a href="#courses-offered" className={` ${button_big} border-orange-light bg-orange-light`}>COURSES OFFERED</a>
          <a href="#why-choose-us" className={` ${button_big} border-[#373737] bg-[#373737]`}>WHY CHOOSE US</a>
        </div>

        {/*Tagline*/}
        <p className="mt-44 font-major font-medium text-2xl text-[#373737] text-center">We have been shaping <span className="text-orange-light">careers</span> for technological trailblazers across <span className="text-orange-light">industries</span> for <span className="text-orange-light">23 years</span>.</p>
      </section>

      {/*News and Announcements*/}
      <section className="mx-40 mt-[152px] mb-16">
        {/*Top Section*/}
        <div className="grid grid-cols-2">
          <div className="">
            <div className="flex items-center">
              <h1 className="text-[#585858] text-2xl font-medium flex">NEWS AND ANNOUNCEMENTS</h1>
              <button className="ml-auto flex justify-center items-center border h-8 w-32  border-[#4D4D4D] text-[#4D4D4D] text-xs rounded-full">
                READ MORE 
                <img 
                  src="/home-page_assets/grey-arrow-icon.png" 
                  className="ml-2 w-4 h-3"
                /> 
              </button>
            </div>

            <h1 className="mt-6 text-[#373737] text-5xl font-medium">CHECK OUT THE LATEST <br/><span className="text-orange-light">COLLEGE UPDATES</span></h1>
            
            <p className="mt-1 text-[#828282] text-base font-normal">Stay informed with the latest updates, official announcements, and <br/> important notices</p>
          </div>

          {/*Featured Card*/}
          <div className="ml-8 w-lg h-52 flex bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] rounded-lg">
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
                <h1 className="text-xl font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
                <button className="ml-auto mt-auto mr-3 mb-3 flex justify-center items-center h-8 w-28 border border-orange-light rounded-full text-orange-light text-xs font-normal">
                  Read Now
                  <img 
                    src="/home-page_assets/orange-arrow-icon.png"  
                    className="ml-1.5 w-5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/*Bottom Section*/}
        <div className="mt-8 grid grid-cols-4">
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-3 flex flex-col h-20">
              <h1 className="text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <button className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2"
                />
              </button>
            </div>
          </div>
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-3 flex flex-col h-20">
              <h1 className="text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <button className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2"
                />
              </button>
            </div>
          </div>
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-3 flex flex-col h-20">
              <h1 className="text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <button className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2"
                />
              </button>
            </div>
          </div>
          <div className={`${card_small}`}>
            <div className="flex items-center">
              <p className="font-minor font-normal text-[#4D4D4D] text-[8px]">December 26, 2025</p>
              <span className="ml-auto font-minor font-bold text-[8px] text-white text-center border border-orange-light rounded-sm bg-orange-light w-8 h-3.5">NEWS</span>
            </div>
            <div className="mt-3 flex flex-col h-20">
              <h1 className="text-4 font-bold">WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <button className="ml-auto mt-auto flex justify-center items-center h-4.5 w-17.5 border border-orange-light rounded-full text-orange-light text-[8px] font-normal">
                Read More
                <img 
                  src="/home-page_assets/orange-arrow-icon.png"  
                  className="ml-1 w-3 h-2"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="bg-[#1e1e1e] py-40 px-52 relative">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-orange-light font-medium text-6xl my-4">ABOUT.</h1>
            <p className="text-white font-medium text-4 leading-8 w-160">Founded in <span className="text-orange-light font-bold">2002</span> under BOR Resolution No. 34, the College of Information and Communications Technology (CICT) began as the <span className="text-orange-light font-bold">Institute of Information and Communications Technology (IICT)</span> and launched the <span className="text-orange-light font-bold">BS in Information Technology (BSIT)</span> and <span className="text-orange-light font-bold">BS in Information Management (BSIM)</span> programs in AY 2002-2003, producing its first graduates soon after.</p>
          </div>
          <img
            src="/home-page_assets/cict-logo.png"
            className="w-69 h-auto absolute right-52 top-16"
          />
        </div>

        <div className="ml-auto flex flex-col text-right">
          <h1 className="text-orange-light font-medium text-6xl my-4">MISSION.</h1>
          <p className="text-white font-medium text-4 leading-8 w-150 ml-auto">The WVSU-CICT aims to develop professionals who shall be able to meet the growing manpower  demand by expanding the ICT industries in the country. Being the lead institution of higher learning in <span className="text-orange-light font-bold">Western Visayas.</span></p>
        </div>

        <div>
          <h1 className="text-orange-light font-medium text-6xl my-4">VISION.</h1>
          <p className="text-white font-medium text-4 leading-8 w-150">To be the leading provider of ICT education in <span className="text-orange-light font-bold">Western Visayas</span>, aligned with the broader mandate of WVSU as the lead institution of higher learning in the region.</p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mx-40 my-20">
        <h1 className="text-[#363636] font-medium text-[80px]">Why Choose <span className="text-orange-light">Us</span>?</h1>
        <div className={` ${divider} flex items-center border-t-[#363636] `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-16 h-16" />
          <p className="font-medium text-5xl text-[#363636] ml-4">ACCREDITATIONS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-16 h-16" />
          <p className="font-medium text-5xl text-[#363636] ml-4">NATIONAL RANKINGS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-16 h-16" />
          <p className="font-medium text-5xl text-[#363636] ml-4">INTERNATIONAL RELATIONS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-16 h-16" />
          <p className="font-medium text-5xl text-[#363636] ml-4">COMPETITION RECOGNITIONS</p>
        </div>
        <div className={` ${divider} flex items-center `}>
          <img src="/home-page_assets/cict-emblem-thick.png" className="w-16 h-16" />
          <p className="font-medium text-5xl text-[#363636] ml-4">INTERNATIONAL ENGAGEMENTS</p>
        </div>
      </section>

      {/* Offered Programs Section */}
      <section className="mx-40 my-20">
        <h1 className="text-[#363636] font-medium text-6xl">INTERESTED IN THE COLLEGE? SEE WHAT <span className="text-orange-light font-bold">WE OFFER</span> IN THE TABLE</h1>
        <div className="w-full h-196 bg-[#F0F0F0] rounded-[92px]">
          <h2>Offered Programs</h2>
          <button>
            READ MORE 
            <img 
              src="/home-page_assets/grey-arrow-icon.png"
              className="w-4 h-3"
            /> 
          </button>
          <div>
            <h3>BSEMC</h3>
          </div>
          <div>
            <h3>BSCS</h3>
          </div>
          <div>
            <h3>BLIS</h3>
          </div>
          <div>
            <h3>BSIS</h3>
          </div>
          <div>
            <h3>BSIT</h3>
          </div>
          <div>
            <h3>MIT</h3>
          </div>
        </div>
      </section>
    </main>
  );
}
