import React from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <p className="footer__text">
            Made by <span className="footer__name">Shubhranshu Pandey</span>
          </p>
          <div className="footer__links">
            <a
              href="https://www.linkedin.com/in/shubhranshu-pandey21/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
              aria-label="LinkedIn Profile"
            >
              <FaLinkedin size={20} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/shubhranshu-pandey"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
              aria-label="GitHub Profile"
            >
              <FaGithub size={20} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

