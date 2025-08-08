import React from "react";
import "@/css/HomeLanding.css";
import homeSec1Img from "@/assets/imgs/home-sec-1.png";
import { FaComments, FaHandshake, FaQuestionCircle, FaBook } from "react-icons/fa";

interface HomeLandingProps {
  isLoginVisible: boolean;
}

const HomeLanding = ({ isLoginVisible }: HomeLandingProps) => {
  return (
    <div style={{ position: "relative" }}>
      <div
        className="home-landing-content"
        style={{ filter: isLoginVisible ? "blur(10px)" : "none" }}
      >
        <div className="home-sections">
          {/* Section 1 */}
          <div className="home-sec sec-1">
            <div className="sec-text">
              <p className="tagline">Your career is more than learning skills</p>
              <h3>
                It’s the questions you didn’t expect, the rejections that taught you something, and the wins that changed everything.
              </h3>
              <h3>
                This is where those moments are shared - so someone else can learn from them.
              </h3>
            </div>
            <div className="sec-image">
              <img src={homeSec1Img} alt="Home Section 1" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="home-sec sec-2">
            <h2 className="section-heading">What You’ll Find</h2>
            <div className="features-grid">
              <div className="feature-item">
                <FaComments size={40} />
                <h4>Authentic Stories</h4>
                <p>Read unfiltered interview accounts from people who’ve been in your seat - the good, the bad, and the awkward.</p>
              </div>
              <div className="feature-item">
                <FaHandshake size={40} />
                <h4>Mock Interview Marketplace</h4>
                <p>Practice with real professionals. Get direct, constructive feedback that boosts confidence.</p>
              </div>
              <div className="feature-item">
                <FaQuestionCircle size={40} />
                <h4>Candid Q&amp;A</h4>
                <p>Ask the questions you can’t ask anywhere else. Learn from a community that wants to see you succeed.</p>
              </div>
              <div className="feature-item">
                <FaBook size={40} />
                <h4>Curated Resources</h4>
                <p>A living library of articles, videos, and tools - all organized to make your prep smarter.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="home-sec sec-3">
            <h2 className="section-heading">Because the hardest part isn’t getting the job. It’s getting ready.</h2>
            <p className="section-text">
              Preparation isn’t about memorizing answers - it’s about understanding the game, the people, and the timing.
              Here, we share what no recruiter’s guide ever will: the real roadmaps to nailing your next opportunity.
            </p>
          </div>

          {/* Section 4 */}
          <div className="home-sec sec-4">
            <blockquote className="quote">
              "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult."
              <span> - Seneca</span>
            </blockquote>
            <p className="section-text">
              Join a community where knowledge is currency, stories are shared freely, and opportunity is just one connection away.
            </p>
            <div className="cta-buttons">
              <button className="btn-google">Sign In with Google</button>
            </div>
          </div>
        </div>
        <div className="bottom-home-landing"
        style={{
             display: isLoginVisible ? "none" : "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"

        }}>
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
