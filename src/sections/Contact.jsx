import { lazy, Suspense, useState } from "react";

import TitleHeader from "../components/TitleHeader";
import { apiBaseUrl, apiUrl } from "../lib/api";

const ContactExperience = lazy(
  () => import("../components/models/contact/ContactExperience")
);

const initialForm = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    if (!apiBaseUrl) {
      setError("The contact service is not configured yet. Please try again later.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiUrl("contact/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (response.status === 429) {
        throw new Error("Too many messages were sent recently. Please wait and try again.");
      }
      if (response.status === 400) {
        throw new Error("Please check your name, email, subject, and message.");
      }
      if (!response.ok) throw new Error("The message could not be submitted. Please try again later.");

      setForm(initialForm);
      setSuccess("Thanks for reaching out. Your message has been received.");
    } catch (submissionError) {
      setError(
        submissionError instanceof TypeError
          ? "The contact service could not be reached. Please try again later."
          : submissionError.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Get in Touch – Let’s Connect"
          sub="💬 Have questions or ideas? Let’s talk!"
        />
        <div className="grid-12-cols mt-16">
          <div className="xl:col-span-5">
            <div className="flex-center card-border rounded-xl p-10">
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-7">
                <div>
                  <label htmlFor="name">Your name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="What’s your good name?"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email">Your email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="What’s your email address?"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What would you like to discuss?"
                    maxLength={160}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message">Your message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can I help you?"
                    rows="5"
                    maxLength={5000}
                    required
                  />
                </div>

                {error && <p role="alert" className="text-red-300">{error}</p>}
                {success && <p role="status" className="text-green-300">{success}</p>}

                <button type="submit" disabled={loading} aria-busy={loading}>
                  <div className="cta-button group">
                    <div className="bg-circle" />
                    <p className="text">{loading ? "Sending…" : "Send Message"}</p>
                    <div className="arrow-wrapper">
                      <img src={`${import.meta.env.BASE_URL}images/arrow-down.svg`} alt="" />
                    </div>
                  </div>
                </button>
              </form>
            </div>
          </div>
          <div className="xl:col-span-7 min-h-96">
            <div className="bg-[#cd7c2e] w-full h-full hover:cursor-grab rounded-3xl overflow-hidden">
              <Suspense fallback={null}>
                <ContactExperience />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
