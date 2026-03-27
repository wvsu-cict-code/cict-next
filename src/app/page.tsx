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
        <p>We have been shaping careers for technological trailblazers across industries for 23 years.</p>
      </section>
    </main>
  );
}
