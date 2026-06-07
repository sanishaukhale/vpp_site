import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { SITE_INFO } from "../constants/siteInfo";
import SEO from "../components/SEO";

// Define form validation schema using Zod
const contactSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Check if EmailJS environment variables are configured
    const isEmailJSEnabled = !!(serviceId && templateId && publicKey);

    try {
      if (isEmailJSEnabled) {
        // Map form parameters to EmailJS template variables
        const templateParams = {
          from_name: data.name,
          reply_to: data.email,
          subject: data.subject,
          message: data.message,
          to_name: SITE_INFO.shortName
        };

        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        toast.success("Message sent successfully! We will get back to you soon.");
      } else {
        // Mock email submission for development/fallback mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("EmailJS is not configured. Form Data submitted:", data);
        toast.success("Message submitted (Mock Mode)! We will get back to you soon.");
      }
      reset();
    } catch (error) {
      console.error("Failed to send contact message:", error);
      toast.error(error.message || "Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us" 
        description={`Get in touch with ${SITE_INFO.name}. Contact details, location, and enquiry form.`}
        keywords="contact, phone, email, address, enquiry, volunteer, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">Get In Touch</span>
          <h1 className="font-playfair">Contact Us</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> Contact
          </p>
        </div>
      </section>

      {/* Contact Details and Form Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ gap: "var(--sp-12)", alignItems: "start" }}>
            
            {/* Contact Details Column */}
            <div>
              <span className="badge badge-primary mb-4">Connect</span>
              <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>
                Get in Touch With Us
              </h2>
              <p style={{ color: "var(--color-text-light)", lineHeight: "1.7", marginBottom: "var(--sp-8)" }}>
                Whether you have a query about our programs, wish to volunteer, or want to collaborate on social welfare projects, feel free to reach out. Our coordinators will assist you.
              </p>

              {/* Info cards list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
                <div className="card" style={{ padding: "var(--sp-5)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ fontSize: "1.75rem" }}>📍</div>
                  <div>
                    <h4 style={{ fontWeight: "700", margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>Our Address</h4>
                    <p style={{ color: "var(--color-text-light)", margin: 0, fontSize: "var(--text-sm)" }}>{SITE_INFO.address}</p>
                  </div>
                </div>

                <div className="card" style={{ padding: "var(--sp-5)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ fontSize: "1.75rem" }}>📞</div>
                  <div>
                    <h4 style={{ fontWeight: "700", margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>Call Us</h4>
                    <p style={{ color: "var(--color-text-light)", margin: 0, fontSize: "var(--text-sm)" }}>{SITE_INFO.phone}</p>
                  </div>
                </div>

                <div className="card" style={{ padding: "var(--sp-5)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ fontSize: "1.75rem" }}>✉️</div>
                  <div>
                    <h4 style={{ fontWeight: "700", margin: "0 0 0.25rem 0", fontSize: "var(--text-sm)" }}>Email Us</h4>
                    <p style={{ color: "var(--color-text-light)", margin: 0, fontSize: "var(--text-sm)" }}>{SITE_INFO.email}</p>
                  </div>
                </div>
              </div>

              {/* Individual Contacts list */}
              {SITE_INFO.contacts && (
                <div style={{ marginTop: "var(--sp-8)" }}>
                  <h3 className="font-playfair" style={{ fontSize: "1.25rem", color: "var(--color-secondary)", fontWeight: "700", marginBottom: "var(--sp-4)" }}>
                    Direct Contacts
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {SITE_INFO.contacts.map((c, idx) => (
                      <p key={idx} style={{ color: "var(--color-text-light)", margin: 0 }}>
                        <strong>{c.name}:</strong> {c.phone}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form Column */}
            <div className="card" style={{ padding: "var(--sp-8)", borderTop: "4px solid var(--color-primary)" }}>
              <h3 className="font-playfair" style={{ fontSize: "1.5rem", color: "var(--color-secondary)", fontWeight: "700", marginBottom: "var(--sp-6)" }}>
                Send a Message
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>Full Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Enter your name"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      outline: "none"
                    }}
                  />
                  {errors.name && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.name.message}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>Email Address</label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      outline: "none"
                    }}
                  />
                  {errors.email && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.email.message}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>Subject</label>
                  <input
                    type="text"
                    {...register("subject")}
                    placeholder="Subject of inquiry"
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      outline: "none"
                    }}
                  />
                  {errors.subject && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.subject.message}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "600", textTransform: "uppercase", marginBottom: "0.25rem" }}>Message</label>
                  <textarea
                    rows="4"
                    {...register("message")}
                    placeholder="Write your message here..."
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      outline: "none",
                      resize: "none"
                    }}
                  />
                  {errors.message && <p style={{ color: "var(--color-primary)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.75rem 1.5rem", fontSize: "var(--text-base)", fontWeight: "600", marginTop: "var(--sp-2)" }}
                >
                  {loading ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
