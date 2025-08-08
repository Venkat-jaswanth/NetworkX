import "@/css/topbar.css"; // Assuming you have a CSS file for styling

interface TopBarProps {
  toggleLogin: () => void;
  isLoginVisible: boolean;
}



const TopBar = ({ toggleLogin, isLoginVisible }: TopBarProps) => {
  return (
    <div className="top-bar">
        <div className="brand-name" onClick={isLoginVisible ? toggleLogin : undefined}>
        <h2>Kairo</h2>
      </div>
      <button onClick={toggleLogin}>
        {isLoginVisible ? "Back To Home" : "Sign up"}
      </button>
      
    </div>
  );
};



export default TopBar;
