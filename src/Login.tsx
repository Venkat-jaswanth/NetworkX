import { signInWithGoogle } from "@/services/authService";
import HomeLanding from "./pages/HomeLanding";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import "@/css/homelanding.css";
import img from "@/assets/imgs/undraw_workspace_s6wf.svg"; // Assuming you have a login image
export default function Login() {
  const [isLoginVisible, setLoginVisible] = useState(false);

  const toggleLogin = () => {
    setLoginVisible(!isLoginVisible);
  };

  return (
    <>
      <TopBar toggleLogin={toggleLogin} isLoginVisible={isLoginVisible} />
      <HomeLanding isLoginVisible={isLoginVisible} setIsLoginVisible={setLoginVisible} />
      <div
        className="login-container "
        style={{ display: isLoginVisible ? "block" : "none" }}
      >
        <div className="login-div">
          <div className="login-title"
          style={{ 
            textAlign: "center" ,
            borderBottom: "2px solid",
            width: "100%",
          }}>
          <h1>Welcome to Kairo!!</h1>
          </div>
          <div className="login-div-text">
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}>
            <div>Your career isn’t built in a single moment</div>{" "}
            <div>
              <img src={img} alt="" style={{ width: "auto", height: "4rem" }} />
            </div>
            </div>
            <div style={{ 
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexDirection: "column"

            }}>
              - it’s shaped by the questions you answer,{" "}
            the lessons you learn, and the people you meet along the way.
            <div>We’re here to help you shape yours.</div>
          </div>
          </div>
          <div className="login-button">
            <button onClick={signInWithGoogle}>
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAw1BMVEVHcEz////////9/f39/f79/f33+Pj////b3d74+fny8/P19vYAAAD////w8fH////////9/f3///8+fu7ZRCpBmEtNnVXaTDbbUz79/Pz0uCtIm1EqdO2FqPJplvDqpJ282MDifG87l0DW4fvXOBWqzrDvurbt8v55oPLkjIH00Mx0sHuRvpVpq3BrrHL2wEn51Y/4zHbw6eP4uBf86MP0sw6EpvJEhdRSie50prrFrCrsrqfqkSrssavxrDPP48yyx/Yvv4yqAAAAEnRSTlMAWZFT48ytmAumbmsCSV/Uv52LM4rJAAABN0lEQVQokY2SiXKCMBCGEUHBW5qQhGgRKopn7zq9ff+n6mZLNIAz7T/OZDdf8rO7xrL+p749Gg5Hdv8CsoOT7ApqBCU1TNYOKmrX2DpereJ1hf56LhhhjBHCFqazh0lCOOeMwW8e44Z3Nk0Y52TO+ZyQxDRGT7hH3kUQiDjRRSnWVMEH4+ShUnGzcH16/CKfl9pxYb2LomehNvLp9AWULyF2ATqw3kfRLZ6eXKEmNxA7f0Fti/BaCaC2HWNBUTjThRwBqnWsW3mTIS1aWYJtrlvBIWQ0DCne/T4Un8QhWL6K9hIo3e1pKg+TqdrxjcHv4G4o4YhMX43BW11MspRKKSlNM0y7+g9tYSpm281mO8NJBa3zU2hV52owy+oIE4lO+fl5/gkL36s93N7Adx3H9Qe9GioOlNMflcoty3IDwqwAAAAASUVORK5CYII="
                alt=""
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
