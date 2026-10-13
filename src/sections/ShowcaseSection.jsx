import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { portfolioProjects } from "../constants";
import { apiBaseUrl, apiUrl } from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

const ShowcaseSection = () => {
  const sectionRef = useRef(null);
  const [projects, setProjects] = useState(portfolioProjects);
  const [loading, setLoading] = useState(Boolean(apiBaseUrl));
  const [apiNotice, setApiNotice] = useState("");

  useEffect(() => {
    if (!apiBaseUrl) return;

    const controller = new AbortController();
    fetch(apiUrl("projects/"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Project service is unavailable.");
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Project response was invalid.");
        setProjects(data.map((project) => {
          const fallback = portfolioProjects.find((item) => item.slug === project.slug);
          return {
            ...project,
            id: project.id ?? project.slug,
            image: project.image || fallback?.image || "",
            fallbackImage: fallback?.image || portfolioProjects[0].image,
          };
        }));
        setApiNotice("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setProjects(portfolioProjects);
          setApiNotice("Project service is unavailable. Showing the saved portfolio projects.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useGSAP(() => {
    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 });
    gsap.utils.toArray(".showcase-project").forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3 * (index + 1),
          scrollTrigger: { trigger: card, start: "top bottom-=100" },
        }
      );
    });
  }, { dependencies: [projects], scope: sectionRef });

  const renderProject = (project, index) => (
    <article
      key={project.id ?? project.slug ?? project.title}
      className={`showcase-project ${index === 0 ? "first-project-wrapper" : "project"}`}
    >
      <div className={`image-wrapper ${index === 1 ? "bg-[#FFEFDB]" : index === 2 ? "bg-[#FFE7EB]" : ""}`}>
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} screenshot`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              if (project.fallbackImage) event.currentTarget.src = project.fallbackImage;
              else event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-black-50">
            Screenshot not available
          </div>
        )}
      </div>
      <div className={index === 0 ? "text-content" : ""}>
        <h2>{project.title}</h2>
        <p className="text-white-50">{project.short_description || project.description}</p>
        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
          <p className="text-white-50">{project.technologies.join(" · ")}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer" className="text-white-50 underline underline-offset-4">
              GitHub repository
            </a>
          )}
          {project.live_demo_url && (
            <a href={project.live_demo_url} target="_blank" rel="noreferrer" className="text-white-50 underline underline-offset-4">
              Live demo
            </a>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <section id="work" ref={sectionRef} className="app-showcase">
      <div className="w-full">
        {apiNotice && <p className="mb-5 text-center text-white-50" role="status">{apiNotice}</p>}
        <div className="showcaselayout">
          {loading ? (
            <p className="text-white-50" role="status">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-white-50" role="status">No published projects are available yet.</p>
          ) : (
            <>
              {renderProject(projects[0], 0)}
              {projects.length > 1 && (
                <div className="project-list-wrapper overflow-hidden">
                  {projects.slice(1).map((project, index) => renderProject(project, index + 1))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
