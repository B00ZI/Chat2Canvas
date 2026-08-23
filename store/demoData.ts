import type { Project } from "@/lib/types";

/**
 * Seed board shown on first run / whenever persistence is disabled
 * (TEST_MODE). Kept out of the store file for readability.
 */
export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-proj",
    name: "Demo Project",
    columns: [
      {
        id: "demo-col-1",
        title: "To Do",
        color: "#f1f5f9",
        cards: [
          {
            id: "demo-card-1",
            title: "Design landing page",
            description:
              "Create wireframes and high-fidelity mockups for the new landing page",
            color: "#dbeafe",
            isDone: false,
            tasks: [
              { text: "Research competitor layouts", done: true },
              { text: "Create wireframes", done: true },
              { text: "Design high-fidelity mockups", done: false },
              { text: "Get stakeholder approval", done: false },
            ],
          },
          {
            id: "demo-card-2",
            title: "Set up CI/CD pipeline",
            description: "",
            color: "#e0e7ff",
            isDone: false,
            tasks: [
              { text: "Configure GitHub Actions", done: false },
              { text: "Add linting step", done: false },
              { text: "Add test runner", done: false },
            ],
          },
          {
            id: "demo-card-3",
            title: "Write API documentation",
            description: "Document all REST endpoints with examples",
            color: "#fce7f3",
            isDone: false,
            tasks: [
              { text: "Document auth endpoints", done: false },
              { text: "Document user endpoints", done: false },
              { text: "Add request/response examples", done: false },
            ],
          },
        ],
      },
      {
        id: "demo-col-2",
        title: "In Progress",
        color: "#e0f2fe",
        cards: [
          {
            id: "demo-card-4",
            title: "Implement user authentication",
            description: "JWT-based auth with refresh tokens",
            color: "#cffafe",
            isDone: false,
            tasks: [
              { text: "Set up JWT library", done: true },
              { text: "Create login endpoint", done: true },
              { text: "Create register endpoint", done: true },
              { text: "Add refresh token flow", done: false },
              { text: "Write integration tests", done: false },
            ],
          },
          {
            id: "demo-card-5",
            title: "Database schema migration",
            description: "",
            color: "#a5f3fc",
            isDone: false,
            tasks: [
              { text: "Design new tables", done: true },
              { text: "Write migration scripts", done: false },
              { text: "Test rollback", done: false },
            ],
          },
        ],
      },
      {
        id: "demo-col-3",
        title: "Review",
        color: "#fef3c7",
        cards: [
          {
            id: "demo-card-6",
            title: "Performance audit",
            description: "Lighthouse audit and bundle analysis",
            color: "#fef9c3",
            isDone: false,
            tasks: [
              { text: "Run Lighthouse", done: true },
              { text: "Analyze bundle size", done: true },
              { text: "Optimize images", done: true },
              { text: "Write up findings", done: false },
            ],
          },
        ],
      },
      {
        id: "demo-col-4",
        title: "Done",
        color: "#dcfce7",
        cards: [
          {
            id: "demo-card-7",
            title: "Project setup",
            description: "Initialize repo with Next.js, Tailwind, and ESLint",
            color: "#d1fae5",
            isDone: true,
            tasks: [
              { text: "Create Next.js app", done: true },
              { text: "Install Tailwind CSS", done: true },
              { text: "Configure ESLint", done: true },
              { text: "Set up folder structure", done: true },
            ],
          },
          {
            id: "demo-card-8",
            title: "Component library",
            description: "Set up shadcn/ui with base components",
            color: "#bbf7d0",
            isDone: true,
            tasks: [
              { text: "Install shadcn/ui", done: true },
              { text: "Add Button, Dialog, Input", done: true },
              { text: "Configure theme", done: true },
            ],
          },
        ],
      },
    ],
  },
];
