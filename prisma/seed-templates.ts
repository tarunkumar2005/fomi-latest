import { PrismaClient } from "../src/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const BUILT_IN_TEMPLATES = [
  // ==================== PERSONAL CATEGORY ====================
  {
    name: "Contact Information",
    description: "Basic contact details including name, email, and phone",
    category: "personal",
    icon: "User",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Full Name",
        required: true,
        order: 1,
      },
      {
        type: "email",
        question: "Email Address",
        required: true,
        order: 2,
      },
      {
        type: "phone",
        question: "Phone Number",
        required: true,
        order: 3,
      },
      {
        type: "multiple-choice",
        question: "Preferred Contact Method",
        required: false,
        order: 4,
        options: JSON.stringify([
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
          { label: "Text Message", value: "text" },
        ]),
      },
    ],
  },
  {
    name: "Full Address",
    description: "Complete mailing address with all components",
    category: "personal",
    icon: "MapPin",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Street Address",
        required: true,
        order: 1,
      },
      {
        type: "short-answer",
        question: "Apartment, Suite, Unit, etc. (Optional)",
        required: false,
        order: 2,
      },
      {
        type: "short-answer",
        question: "City",
        required: true,
        order: 3,
      },
      {
        type: "dropdown",
        question: "State / Province",
        required: true,
        order: 4,
        options: JSON.stringify([
          { label: "California", value: "CA" },
          { label: "New York", value: "NY" },
          { label: "Texas", value: "TX" },
          { label: "Florida", value: "FL" },
          { label: "Other", value: "other" },
        ]),
      },
      {
        type: "short-answer",
        question: "ZIP / Postal Code",
        required: true,
        order: 5,
      },
      {
        type: "dropdown",
        question: "Country",
        required: true,
        order: 6,
        options: JSON.stringify([
          { label: "United States", value: "US" },
          { label: "Canada", value: "CA" },
          { label: "United Kingdom", value: "UK" },
          { label: "India", value: "IN" },
          { label: "Other", value: "other" },
        ]),
      },
    ],
  },
  {
    name: "Emergency Contact",
    description: "Emergency contact person and details",
    category: "personal",
    icon: "AlertCircle",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Emergency Contact Name",
        required: true,
        order: 1,
      },
      {
        type: "dropdown",
        question: "Relationship",
        required: true,
        order: 2,
        options: JSON.stringify([
          { label: "Spouse", value: "spouse" },
          { label: "Parent", value: "parent" },
          { label: "Sibling", value: "sibling" },
          { label: "Friend", value: "friend" },
          { label: "Other", value: "other" },
        ]),
      },
      {
        type: "phone",
        question: "Emergency Contact Phone",
        required: true,
        order: 3,
      },
      {
        type: "email",
        question: "Emergency Contact Email",
        required: false,
        order: 4,
      },
    ],
  },

  // ==================== BUSINESS CATEGORY ====================
  {
    name: "Company Details",
    description: "Business or company information",
    category: "business",
    icon: "Building2",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Company Name",
        required: true,
        order: 1,
      },
      {
        type: "dropdown",
        question: "Company Size",
        required: true,
        order: 2,
        options: JSON.stringify([
          { label: "1-10 employees", value: "1-10" },
          { label: "11-50 employees", value: "11-50" },
          { label: "51-200 employees", value: "51-200" },
          { label: "201-500 employees", value: "201-500" },
          { label: "500+ employees", value: "500+" },
        ]),
      },
      {
        type: "dropdown",
        question: "Industry",
        required: true,
        order: 3,
        options: JSON.stringify([
          { label: "Technology", value: "tech" },
          { label: "Healthcare", value: "healthcare" },
          { label: "Finance", value: "finance" },
          { label: "Education", value: "education" },
          { label: "Retail", value: "retail" },
          { label: "Other", value: "other" },
        ]),
      },
      {
        type: "url",
        question: "Company Website",
        required: false,
        order: 4,
      },
    ],
  },
  {
    name: "Work Experience",
    description: "Employment history with job details",
    category: "business",
    icon: "Briefcase",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Job Title",
        required: true,
        order: 1,
      },
      {
        type: "short-answer",
        question: "Company Name",
        required: true,
        order: 2,
      },
      {
        type: "date",
        question: "Start Date",
        required: true,
        order: 3,
      },
      {
        type: "date",
        question: "End Date",
        required: false,
        order: 4,
      },
      {
        type: "checkboxes",
        question: "Employment Status",
        required: false,
        order: 5,
        options: JSON.stringify([
          { label: "Currently working here", value: "current" },
        ]),
      },
      {
        type: "paragraph",
        question: "Job Description",
        required: false,
        order: 6,
      },
    ],
  },
  {
    name: "Professional References",
    description: "Reference contact information",
    category: "business",
    icon: "Users",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Reference Name",
        required: true,
        order: 1,
      },
      {
        type: "short-answer",
        question: "Company / Organization",
        required: true,
        order: 2,
      },
      {
        type: "short-answer",
        question: "Job Title",
        required: true,
        order: 3,
      },
      {
        type: "phone",
        question: "Phone Number",
        required: true,
        order: 4,
      },
      {
        type: "email",
        question: "Email Address",
        required: true,
        order: 5,
      },
      {
        type: "dropdown",
        question: "Relationship",
        required: true,
        order: 6,
        options: JSON.stringify([
          { label: "Former Manager", value: "manager" },
          { label: "Colleague", value: "colleague" },
          { label: "Client", value: "client" },
          { label: "Other", value: "other" },
        ]),
      },
    ],
  },

  // ==================== EDUCATION CATEGORY ====================
  {
    name: "Education History",
    description: "Academic background and qualifications",
    category: "education",
    icon: "GraduationCap",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "School / University Name",
        required: true,
        order: 1,
      },
      {
        type: "dropdown",
        question: "Degree Type",
        required: true,
        order: 2,
        options: JSON.stringify([
          { label: "High School", value: "high-school" },
          { label: "Associate Degree", value: "associate" },
          { label: "Bachelor's Degree", value: "bachelor" },
          { label: "Master's Degree", value: "master" },
          { label: "Doctorate", value: "doctorate" },
          { label: "Other", value: "other" },
        ]),
      },
      {
        type: "short-answer",
        question: "Field of Study",
        required: true,
        order: 3,
      },
      {
        type: "date",
        question: "Graduation Date",
        required: false,
        order: 4,
      },
      {
        type: "number",
        question: "GPA (Optional)",
        required: false,
        order: 5,
        validation: JSON.stringify({ min: 0, max: 4.0 }),
      },
    ],
  },
  {
    name: "Certifications",
    description: "Professional certifications and licenses",
    category: "education",
    icon: "Award",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Certification Name",
        required: true,
        order: 1,
      },
      {
        type: "short-answer",
        question: "Issuing Organization",
        required: true,
        order: 2,
      },
      {
        type: "date",
        question: "Issue Date",
        required: true,
        order: 3,
      },
      {
        type: "date",
        question: "Expiration Date",
        required: false,
        order: 4,
      },
      {
        type: "short-answer",
        question: "Credential ID (Optional)",
        required: false,
        order: 5,
      },
      {
        type: "url",
        question: "Credential URL (Optional)",
        required: false,
        order: 6,
      },
    ],
  },

  // ==================== PAYMENT CATEGORY ====================
  {
    name: "Payment Information",
    description: "Credit card or payment details",
    category: "payment",
    icon: "CreditCard",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Cardholder Name",
        required: true,
        order: 1,
      },
      {
        type: "number",
        question: "Card Number",
        required: true,
        order: 2,
        validation: JSON.stringify({ minLength: 13, maxLength: 19 }),
      },
      {
        type: "short-answer",
        question: "Expiration Date (MM/YY)",
        required: true,
        order: 3,
      },
      {
        type: "number",
        question: "CVV",
        required: true,
        order: 4,
        validation: JSON.stringify({ minLength: 3, maxLength: 4 }),
      },
    ],
  },
  {
    name: "Billing Address",
    description: "Billing address for payments",
    category: "payment",
    icon: "Receipt",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Street Address",
        required: true,
        order: 1,
      },
      {
        type: "short-answer",
        question: "City",
        required: true,
        order: 2,
      },
      {
        type: "short-answer",
        question: "State / Province",
        required: true,
        order: 3,
      },
      {
        type: "short-answer",
        question: "ZIP / Postal Code",
        required: true,
        order: 4,
      },
      {
        type: "dropdown",
        question: "Country",
        required: true,
        order: 5,
        options: JSON.stringify([
          { label: "United States", value: "US" },
          { label: "Canada", value: "CA" },
          { label: "United Kingdom", value: "UK" },
          { label: "Other", value: "other" },
        ]),
      },
    ],
  },
  {
    name: "Shipping Address",
    description: "Delivery address for physical goods",
    category: "payment",
    icon: "Package",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Recipient Name",
        required: true,
        order: 1,
      },
      {
        type: "short-answer",
        question: "Street Address",
        required: true,
        order: 2,
      },
      {
        type: "short-answer",
        question: "Apartment, Suite, etc. (Optional)",
        required: false,
        order: 3,
      },
      {
        type: "short-answer",
        question: "City",
        required: true,
        order: 4,
      },
      {
        type: "short-answer",
        question: "State / Province",
        required: true,
        order: 5,
      },
      {
        type: "short-answer",
        question: "ZIP / Postal Code",
        required: true,
        order: 6,
      },
      {
        type: "phone",
        question: "Contact Phone",
        required: true,
        order: 7,
      },
    ],
  },

  // ==================== OTHER CATEGORY ====================
  {
    name: "Social Media Profiles",
    description: "Links to social media accounts",
    category: "other",
    icon: "Share2",
    isBuiltIn: true,
    fields: [
      {
        type: "url",
        question: "LinkedIn Profile",
        required: false,
        order: 1,
      },
      {
        type: "url",
        question: "Twitter / X Profile",
        required: false,
        order: 2,
      },
      {
        type: "url",
        question: "GitHub Profile",
        required: false,
        order: 3,
      },
      {
        type: "url",
        question: "Portfolio Website",
        required: false,
        order: 4,
      },
    ],
  },
  {
    name: "File Upload Section",
    description: "Document or file submission",
    category: "other",
    icon: "Upload",
    isBuiltIn: true,
    fields: [
      {
        type: "file-upload",
        question: "Upload Resume / CV",
        required: true,
        order: 1,
        metadata: JSON.stringify({
          acceptedTypes: ".pdf,.doc,.docx",
          maxFileSize: 5242880, // 5MB
          maxFiles: 1,
        }),
      },
      {
        type: "file-upload",
        question: "Upload Cover Letter (Optional)",
        required: false,
        order: 2,
        metadata: JSON.stringify({
          acceptedTypes: ".pdf,.doc,.docx",
          maxFileSize: 5242880,
          maxFiles: 1,
        }),
      },
      {
        type: "file-upload",
        question: "Additional Documents (Optional)",
        required: false,
        order: 3,
        metadata: JSON.stringify({
          acceptedTypes: ".pdf,.doc,.docx,.jpg,.png",
          maxFileSize: 10485760, // 10MB
          maxFiles: 3,
        }),
      },
    ],
  },
  {
    name: "Medical Information",
    description: "Basic health and medical details",
    category: "other",
    icon: "Heart",
    isBuiltIn: true,
    fields: [
      {
        type: "date",
        question: "Date of Birth",
        required: true,
        order: 1,
      },
      {
        type: "dropdown",
        question: "Blood Type",
        required: false,
        order: 2,
        options: JSON.stringify([
          { label: "A+", value: "A+" },
          { label: "A-", value: "A-" },
          { label: "B+", value: "B+" },
          { label: "B-", value: "B-" },
          { label: "AB+", value: "AB+" },
          { label: "AB-", value: "AB-" },
          { label: "O+", value: "O+" },
          { label: "O-", value: "O-" },
        ]),
      },
      {
        type: "paragraph",
        question: "Known Allergies",
        required: false,
        order: 3,
      },
      {
        type: "paragraph",
        question: "Current Medications",
        required: false,
        order: 4,
      },
      {
        type: "paragraph",
        question: "Medical Conditions",
        required: false,
        order: 5,
      },
    ],
  },
  {
    name: "Event Registration",
    description: "Registration details for events or conferences",
    category: "other",
    icon: "Calendar",
    isBuiltIn: true,
    fields: [
      {
        type: "short-answer",
        question: "Attendee Name",
        required: true,
        order: 1,
      },
      {
        type: "email",
        question: "Email Address",
        required: true,
        order: 2,
      },
      {
        type: "phone",
        question: "Phone Number",
        required: true,
        order: 3,
      },
      {
        type: "short-answer",
        question: "Organization / Company",
        required: false,
        order: 4,
      },
      {
        type: "short-answer",
        question: "Job Title",
        required: false,
        order: 5,
      },
      {
        type: "dropdown",
        question: "T-Shirt Size",
        required: false,
        order: 6,
        options: JSON.stringify([
          { label: "XS", value: "xs" },
          { label: "S", value: "s" },
          { label: "M", value: "m" },
          { label: "L", value: "l" },
          { label: "XL", value: "xl" },
          { label: "XXL", value: "xxl" },
        ]),
      },
      {
        type: "checkboxes",
        question: "Dietary Restrictions",
        required: false,
        order: 7,
        options: JSON.stringify([
          { label: "Vegetarian", value: "vegetarian" },
          { label: "Vegan", value: "vegan" },
          { label: "Gluten-Free", value: "gluten-free" },
          { label: "Halal", value: "halal" },
          { label: "Kosher", value: "kosher" },
          { label: "None", value: "none" },
        ]),
      },
    ],
  },
];

async function seedTemplates() {
  console.log("🌱 Starting template seeding...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const templateData of BUILT_IN_TEMPLATES) {
    const { fields, ...template } = templateData;

    try {
      // Check if template already exists
      const existing = await prisma.sectionTemplate.findFirst({
        where: {
          name: template.name,
          isBuiltIn: true,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipping "${template.name}" - already exists`);
        skippedCount++;
        continue;
      }

      // Create template with fields
      await prisma.sectionTemplate.create({
        data: {
          ...template,
          fields: {
            create: fields,
          },
        },
      });

      console.log(`✅ Created template: "${template.name}"`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Failed to create template "${template.name}":`, error);
    }
  }

  console.log("\n📊 Seeding Summary:");
  console.log(`   ✅ Created: ${createdCount} templates`);
  console.log(`   ⏭️  Skipped: ${skippedCount} templates`);
  console.log(`   📦 Total: ${BUILT_IN_TEMPLATES.length} templates\n`);
}

async function main() {
  try {
    await seedTemplates();
    console.log("✨ Template seeding completed successfully!");
  } catch (error) {
    console.error("💥 Template seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
