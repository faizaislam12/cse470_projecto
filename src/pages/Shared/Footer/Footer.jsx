import React from "react";
import { FaRecycle, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="eco-dark border-t border-emerald-500/10 relative">
      <div className="footer footer-horizontal footer-center p-10 relative z-10">
        <aside>
          <FaRecycle className="text-4xl text-emerald-400" />
          <p className="font-bold eco-gradient-text text-lg">
            GreenLoop
          </p>
          <p className="eco-muted text-sm">
            Recycle Smarter. Live Greener.
          </p>
          <p className="eco-muted text-xs">
            Copyright © {new Date().getFullYear()} GreenLoop — All rights reserved
          </p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a className="text-emerald-300/60 hover:text-emerald-300 transition-colors" aria-label="Facebook">
              <FaFacebookF size={20} />
            </a>
            <a className="text-emerald-300/60 hover:text-emerald-300 transition-colors" aria-label="Twitter">
              <FaTwitter size={20} />
            </a>
            <a className="text-emerald-300/60 hover:text-emerald-300 transition-colors" aria-label="Instagram">
              <FaInstagram size={20} />
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
