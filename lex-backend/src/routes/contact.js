import express from "express"
import { Resend } from "resend"
import { db } from "../config/firebase.js"

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/contact — send contact form email and store in Firestore
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields: name, email, message" })
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name must be a non-empty string" })
    }

    if (typeof email !== "string" || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Email must be a valid email address" })
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message must be a non-empty string" })
    }

    // Store contact form in Firestore
    const contactRef = db.collection("contactForms").doc()
    await contactRef.set({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date(),
      status: "new",
    })

    // Try to send email via Resend (optional, non-blocking)
    let emailResult = null
    try {
      emailResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: `We received your enquiry`,
        html: `
          <h3>Thank you for reaching out, ${name}!</h3>
          <p>We received your message and will get back to you within one business day.</p>
          <hr />
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
        `,
      })
    } catch (emailError) {
      console.error("Email sending failed (non-critical):", emailError.message)
      // Continue even if email fails - contact is stored in Firestore
    }

    res.status(200).json({
      success: true,
      message: "Contact form submitted successfully. We'll get back to you soon.",
      contactId: contactRef.id,
      emailSent: emailResult?.data ? true : false,
    })
  } catch (error) {
    console.error("Contact form submission error:", error)
    res.status(500).json({
      error: "Failed to submit contact form. Please try again later.",
      details: error.message,
    })
  }
})

export default router
