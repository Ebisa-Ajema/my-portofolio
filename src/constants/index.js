const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

const navLinks = [
  {
    name: "Work",
    link: "#work",
  },
  {
    name: "Experience",
    link: "#experience",
  },
  {
    name: "Skills",
    link: "#skills",
  },
  {
    name: "Highlights",
    link: "#testimonials",
  },
];

const words = [
  { text: "Web Apps", imgPath: asset("images/ideas.svg") },
  { text: "Systems", imgPath: asset("images/concepts.svg") },
  { text: "Reports", imgPath: asset("images/designs.svg") },
  { text: "Code", imgPath: asset("images/code.svg") },
  { text: "Web Apps", imgPath: asset("images/ideas.svg") },
  { text: "Systems", imgPath: asset("images/concepts.svg") },
  { text: "Reports", imgPath: asset("images/designs.svg") },
  { text: "Code", imgPath: asset("images/code.svg") },
];

const counterItems = [
  { value: 3, suffix: "", label: "Featured Projects" },
  { value: 2, suffix: "", label: "Internship Experiences" },
  { value: 2, suffix: "", label: "Django Projects" },
  { value: 1, suffix: "", label: "Odoo 17 Project" },
];

const logoIconsList = [
  { name: "React", imgPath: asset("images/logos/react.png") },
  { name: "Python", imgPath: asset("images/logos/python.svg") },
  { name: "Django", imgPath: asset("images/logos/django.png") },
  { name: "Tailwind CSS", imgPath: asset("images/logos/tailwind-css.png") },
  { name: "PostgreSQL", imgPath: asset("images/logos/postgresql.png") },
  { name: "GitHub", imgPath: asset("images/logos/github.png") },
  { name: "Odoo 17", imgPath: asset("images/logos/company-logo-5.png") },
];

const abilities = [
  {
    imgPath: asset("images/web-development.png"),
    title: "Web Development",
    desc: "Building user interfaces with React and Tailwind CSS.",
  },
  {
    imgPath: asset("images/backend-development.png"),
    title: "Backend Development",
    desc: "Creating web applications with Django, Django Templates, and PostgreSQL.",
  },
  {
    imgPath: asset("images/business1-system.png"),
    title: "Business Systems",
    desc: "Working with Odoo 17 for sales and profit reporting.",
  },
];

const techStackImgs = [
  {
    name: "React Developer",
    imgPath: asset("images/logos/react.png"),
  },
  {
    name: "Django",
    imgPath: asset("images/logos/python.svg"),
  },
  {
    name: "Tailwind CSS",
    imgPath: asset("images/logos/react.png"),
  },
  {
    name: "Tailwind CSS",
    imgPath: asset("images/logos/python.svg"),
  },
  {
    name: "PostgreSQL",
    imgPath: asset("images/logos/python.svg"),
  },
];

const techStackIcons = [
  {
    name: "React",
    imgPath: asset("images/logos/react.png"),
  },
  {
    name: "Python",
    imgPath: asset("images/logos/python.svg"),
  },
  {
    name: "Django",
    imgPath: asset("images/logos/django.png"),
  },
  {
    name: "Tailwind CSS",
    imgPath: asset("images/logos/tailwind-css.png"),
  },
  {
    name: "PostgreSQL",
    imgPath: asset("images/logos/postgresql.png"),
  },
];

const expCards = [
  {
    review: "Student Management System built with Django and Django Templates.",
    imgPath: asset("images/logos/github.png"),
    logoPath: asset("images/logos/ebo.png"),
    title: "Gojo City Administration",
    date: "Internship",
    responsibilities: [
      "Internship experience at Gojo City Administration.",
    ],
  },
  {
    review: "Advanced Sales Profit Report developed for Odoo 17.",
    imgPath: asset("images/logos/github.png"),
    logoPath: asset("images/logos/ebo.png"),
    title: "Adama City Administration",
    date: "Internship · City Network / Smart City Department",
    responsibilities: [
      "Internship experience with the City Network / Smart City Department.",
    ],
  },
];

const expLogos = [
  {
    name: "logo1",
    imgPath: asset("images/logo1.png"),
  },
  {
    name: "logo2",
    imgPath: asset("images/logo2.png"),
  },
  {
    name: "logo3",
    imgPath: asset("images/logo3.png"),
  },
];

const testimonials = [
  { name: "Student Management System", mentions: "Django · Django Templates", review: "A student management system built with Django and Django Templates.", imgPath: asset("images/project1.png") },
  { name: "Advanced Sales Profit Report", mentions: "Odoo 17", review: "A sales profit reporting project developed for Odoo 17.", imgPath: asset("images/project2.png") },
  { name: "Gojo City Administration Platform", mentions: "React · Tailwind CSS · Django · PostgreSQL", review: "A city administration platform built with React, Tailwind CSS, Django, and PostgreSQL.", imgPath: asset("images/project3.png") },
];

const portfolioProjects = [
  {
    id: "student-management-system",
    slug: "student-management-system",
    title: "Student Management System",
    short_description: "Built with Django and Django Templates.",
    description: "A student management system built with Django and Django Templates.",
    technologies: ["Django", "Django Templates"],
    image: asset("images/project1.png"),
    github_url: "",
    live_demo_url: "",
    is_featured: true,
  },
  {
    id: "advanced-sales-profit-report",
    slug: "advanced-sales-profit-report",
    title: "Advanced Sales Profit Report",
    short_description: "A sales profit reporting project developed for Odoo 17.",
    description: "A sales profit reporting project developed for Odoo 17.",
    technologies: ["Odoo 17", "Python", "PostgreSQL"],
    image: asset("images/project2.png"),
    github_url: "",
    live_demo_url: "",
    is_featured: false,
  },
  {
    id: "gojo-city-administration-platform",
    slug: "gojo-city-administration-platform",
    title: "Gojo City Administration Platform",
    short_description: "A city administration platform built with React, Tailwind CSS, Django, and PostgreSQL.",
    description: "A city administration platform built with React, Tailwind CSS, Django, and PostgreSQL.",
    technologies: ["React", "Tailwind CSS", "Django", "PostgreSQL"],
    image: asset("images/project3.png"),
    github_url: "",
    live_demo_url: "",
    is_featured: false,
  },
];

const socialImgs = [
  {
    name: "insta",
    imgPath: asset("images/insta.png"),
  },
  {
    name: "fb",
    imgPath: asset("images/fb.png"),
  },
  {
    name: "x",
    imgPath: asset("images/x.png"),
  },
  {
    name: "linkedin",
    imgPath: asset("images/linkedin.png"),
  },
];

export {
  words,
  abilities,
  logoIconsList,
  counterItems,
  expCards,
  expLogos,
  testimonials,
  portfolioProjects,
  socialImgs,
  techStackIcons,
  techStackImgs,
  navLinks,
};
