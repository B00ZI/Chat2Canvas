import type { Project } from "@/lib/types";
import { COLUMN_COLORS } from "@/lib/column-colors";

const [CRIMSON, GOLD, GREEN, TEAL, AZURE, VIOLET] = COLUMN_COLORS;

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
        color: AZURE.value,
        cards: [
          {
            id: "demo-card-1",
            title: "Design landing page",
            description:
              "Create wireframes and high-fidelity mockups for the new landing page",
            color: GOLD.value,
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
            color: VIOLET.value,
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
            color: CRIMSON.value,
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
        color: GOLD.value,
        cards: [
          {
            id: "demo-card-4",
            title: "Implement user authentication",
            description: "JWT-based auth with refresh tokens",
            color: TEAL.value,
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
            color: GREEN.value,
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
        color: VIOLET.value,
        cards: [
          {
            id: "demo-card-6",
            title: "Performance audit",
            description: "Lighthouse audit and bundle analysis",
            color: AZURE.value,
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
        color: GREEN.value,
        cards: [
          {
            id: "demo-card-7",
            title: "Project setup",
            description: "Initialize repo with Next.js, Tailwind, and ESLint",
            color: TEAL.value,
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
            color: GOLD.value,
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
