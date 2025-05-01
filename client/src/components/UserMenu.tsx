import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link } from "wouter";
import { User } from "@shared/schema";

export default function UserMenu() {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  // Close menu when clicking outside
  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  if (!user) {
    return (
      <Link href="/auth" className="auth-link">
        <button className="login-button">
          <i className="fas fa-sign-in-alt"></i> Login
        </button>
      </Link>
    );
  }

  return (
    <div className="user-menu-container">
      <button onClick={toggleMenu} className="user-menu-button">
        <span className="user-icon">
          <i className="fas fa-user-circle"></i>
        </span>
        <span className="username">{user.username}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      
      {isOpen && (
        <>
          <div className="click-overlay" onClick={handleClickOutside}></div>
          <div className="user-dropdown">
            <div className="user-dropdown-header">
              <span className="greeting">Hello, {user.username}!</span>
            </div>
            <div className="user-dropdown-content">
              <button onClick={handleLogout} className="logout-button">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}