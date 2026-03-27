export default function Home() {

  const button_big = "inline-block border-8 rounded-2xl w-xs h-10";

  return (
    <main>
      {/*Landing Page*/}
      <section>
        {/*Header*/}
        <div className="mt-36 text-[#373737] text-center gap-6">
          <h1 className="text-8xl font-medium leading-22">Building the <span className="text-[var(--color-orange-light)]">Digital<br/>Leaders</span> of Tomorrow</h1>
          <h2 className="text-2xl font-normal font-minor mt-6">COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY</h2>
        </div>

        {/*Buttons*/}
        <div className="flex justify-center items-center mt-16 gap-20 text-center text-white text-base font-bold">
          <a href="#courses-offered" className={` ${button_big} border-[var(--color-orange-light)] bg-[var(--color-orange-light)]`}>COURSES OFFERED</a>
          <a href="#why-choose-us" className={` ${button_big} border-[#373737] bg-[#373737]`}>WHY CHOOSE US</a>
        </div>

        {/*Tagline*/}
        <p className="mt-44 font-major font-medium text-2xl text-[#373737] text-center">We have been shaping <span className="text-[var(--color-orange-light)]">careers</span> for technological trailblazers across <span className="text-[var(--color-orange-light)]">industries</span> for <span className="text-[var(--color-orange-light)]">23 years</span>.</p>
      </section>

      {/*News and Announcements*/}
      <section>
        {/*Top Section*/}
        <div>
          <div>
            <h1>NEWS AND ANNOUNCEMENTS</h1>

            <button>READ MORE</button>

            <h1>CHECK OUT THE LATEST COLLEGE UPDATES</h1>
            <p>Stay informed with the latest updates, official announcements, and important notices</p>
          </div>

          {/*Featured Card*/}
          <div>
            <img src="" alt="insert image here" />
            <div>
              <p>2 days ago |</p>
              <span>ANNOUNCEMENT</span>
              <h1>WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
              <button>Read Now</button>
            </div>
          </div>
        </div>
        
        {/*Bottom Section*/}
        <div>
          <div>
            <p>December 26, 2025</p>
            <span>NEWS</span>
            <h1>WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
            <button>Read More</button>
          </div>
          <div>
            <p>December 26, 2025</p>
            <span>NEWS</span>
            <h1>WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
            <button>Read More</button>
          </div>
          <div>
            <p>December 26, 2025</p>
            <span>NEWS</span>
            <h1>WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
            <button>Read More</button>
          </div>
          <div>
            <p>December 26, 2025</p>
            <span>NEWS</span>
            <h1>WVSU-CICT Presents Tech Solutions at ICC 2025 in Taiwan</h1>
            <button>Read More</button>
          </div>
        </div>
      </section>
    </main>
  );
}
