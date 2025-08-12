import { signInWithGoogle } from "@/services/authService";
import "@/css/homelanding.css";
import homeSec1Img from "@/assets/imgs/home-sec-1.png";
import {
  FaComments,
  FaHandshake,
  FaQuestionCircle,
  FaBook,
} from "react-icons/fa";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"; // Import the hook

interface HomeLandingProps {
  isLoginVisible: boolean;
  setIsLoginVisible: (visible: boolean) => void;
}
const HomeLanding = ({ isLoginVisible, setIsLoginVisible } : HomeLandingProps) => {
  // Setup observers for each section
  const [sec1Ref, isSec1Visible] = useIntersectionObserver({ threshold: 0.3 });
  const [sec2Ref, isSec2Visible] = useIntersectionObserver({ threshold: 0.5 });
  const [sec3Ref, isSec3Visible] = useIntersectionObserver({ threshold: 0.7 });
  const [sec4Ref, isSec4Visible] = useIntersectionObserver({ threshold: 0.9 });


  return (
    <div style={{ position: "relative" }}>
      <div
        className="home-landing-content"
        style={{
          filter: isLoginVisible ? "blur(8px)" : "none",
          transition: "filter 1s"
          }}
          onClick={(e) => {
          if (isLoginVisible) {
            // need to change is login visible state
            setIsLoginVisible(false);
            e.stopPropagation();
          }
        }}
      >
        <div className="home-sections">
          {/* Section 1 */}
          <div
            ref={sec1Ref}
            className={`home-sec sec-1 ${isSec1Visible ? 'is-visible' : ''}`}
          >
            <div className="sec-text animate-slide-in-left">
              <p className="tagline">
                Your career is more than learning skills
              </p>
              <h3>
                It’s the questions you didn’t expect, the rejections that taught
                you something, and the wins that changed everything.
              </h3>
              <h3>
                This is where those moments are shared - so someone else can
                learn from them.
              </h3>
            </div>
            <div className="sec-image animate-slide-in-right">
              <img src={homeSec1Img} alt="Home Section 1" />
            </div>
          </div>

          {/* Section 2 */}
          <div
            ref={sec2Ref}
            className={`home-sec sec-2 ${isSec2Visible ? 'is-visible' : ''}`}
          >
            <h2 className="section-heading animate-fade-in">What You’ll Find</h2>
            <div className="features-grid">
              <div className="feature-item animate-fade-in-up">
                <FaComments size={40} />
                <h4>Authentic Stories</h4>
                <p>
                  Read unfiltered interview accounts from people who’ve been in
                  your seat - the good, the bad, and the awkward.
                </p>
              </div>
              <div className="feature-item animate-fade-in-up">
                <FaHandshake size={40} />
                <h4>Mock Interview Marketplace</h4>
                <p>
                  Practice with real professionals. Get direct, constructive
                  feedback that boosts confidence.
                </p>
              </div>
              <div className="feature-item animate-fade-in-up">
                <FaQuestionCircle size={40} />
                <h4>Candid Q&A</h4>
                <p>
                  Ask the questions you can’t ask anywhere else. Learn from a
                  community that wants to see you succeed.
                </p>
              </div>
              <div className="feature-item animate-fade-in-up">
                <FaBook size={40} />
                <h4>Curated Resources</h4>
                <p>
                  A living library of articles, videos, and tools - all
                  organized to make your prep smarter.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div
            ref={sec3Ref}
            className={`home-sec sec-3 ${isSec3Visible ? 'is-visible' : ''}`}
          >
            <h2 className="section-heading animate-fade-in">
              Because the hardest part isn’t getting the job. It’s getting
              ready.
            </h2>
            <p className="section-text animate-fade-in-up">
              Preparation isn’t about memorizing answers - it’s about
              understanding the game, the people, and the timing. Here, we share
              what no recruiter’s guide ever will: the real roadmaps to nailing
              your next opportunity.
            </p>
          </div>

          {/* Section 4 */}
          <div
            ref={sec4Ref}
            className={`home-sec sec-4 ${isSec4Visible ? 'is-visible' : ''}`}
          >
            <blockquote className="quote animate-fade-in">
              "It is not because things are difficult that we do not dare; it is
              because we do not dare that they are difficult."
              <span> - Seneca</span>
            </blockquote>
            <p className="section-text animate-fade-in-up">
              Join a community where knowledge is currency, stories are shared
              freely, and opportunity is just one connection away.
            </p>
            <div className="cta-buttons animate-fade-in-up">
              <button className="btn-google" onClick={signInWithGoogle}>
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
        <div
          className="bottom-home-landing"
          style={{
            display: isLoginVisible ? "none" : "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <h2>Kairo</h2>
          <p>- Your one-stop solution for all your career needs.</p>
          <p>© 2025 Kairo. All rights reserved.</p>
          <p>Made with ❤️ by the Kairo Team</p>
        </div>
      </div>
    </div>
  );
};

export default HomeLanding;
