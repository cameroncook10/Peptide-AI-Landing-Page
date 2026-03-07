import { ContainerScroll } from './ui/container-scroll-animation';

export default function AppShowcase() {
  return (
    <section className="showcase-section">
      <ContainerScroll
        titleComponent={
          <div className="showcase-title">
            <div className="showcase-eyebrow">See It In Action</div>
            <h2 className="showcase-h2">
              Track every metric.<br />
              <span className="accent">See real results.</span>
            </h2>
          </div>
        }
      >
        <div className="showcase-screens">
          <img src="/assets/screen1.png" alt="Stack screen"    className="side"   />
          <img src="/assets/screen2.png" alt="Optimize screen" className="center" />
          <img src="/assets/screen3.png" alt="Insights screen" className="side"   />
        </div>
      </ContainerScroll>
    </section>
  );
}
