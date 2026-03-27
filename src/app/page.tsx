export default function Home() {
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
        <div>
          <a href="#courses-offered">COURSES OFFERED</a>
          <a href="#why-choose-us">WHY CHOOSE US</a>
        </div>

        {/*Tagline*/}
        <p>We have been shaping careers for technological trailblazers across industries for 23 years.</p>
      </section>
    </main>
  );
}
