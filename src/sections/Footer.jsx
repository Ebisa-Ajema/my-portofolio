const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="flex flex-col justify-center">
          <p>Ebo · Developer Portfolio</p>
        </div>
        <div className="socials">
          <p className="text-white-50">React · Django · Odoo 17</p>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-center md:text-end">
            © {new Date().getFullYear()} Ebo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
