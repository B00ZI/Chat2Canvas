import type { Project } from "@/lib/types";
import { COLUMN_COLORS } from "@/lib/column-colors";

const [CRIMSON, GOLD, GREEN, TEAL, AZURE, VIOLET, PINK, GRAPHITE] =
  COLUMN_COLORS;

/**
 * Seed board shown on first run / whenever persistence is disabled
 * (TEST_MODE). Rich enough to show off progress rings, segmented bars,
 * tags, and the completed-cards group.
 */
export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-proj",
    name: "Demo Project",
    description: "",
    createdAt: new Date("2026-08-20T12:00:00").getTime(),
    columns: [
      {
        id: "demo-col-backlog",
        title: "Backlog",
        color: AZURE.value,
        cards: [
          {
            id: "demo-card-b1",
            title: "Multi-language support",
            description: "i18n scaffolding with locale files and a language switcher",
            color: GRAPHITE.value,
            isDone: false,
            tags: [{ name: "i18n", color: AZURE.value }],
            tasks: [
              { text: "Research i18n libraries", done: false },
              { text: "Extract UI strings", done: false },
            ],
          },
          {
            id: "demo-card-b2",
            title: "Accessibility audit",
            description: "",
            color: VIOLET.value,
            isDone: false,
            tags: [{ name: "quality", color: PINK.value }],
            tasks: [
              { text: "Keyboard-only walkthrough", done: false },
              { text: "Contrast pass on both themes", done: false },
              { text: "Screen reader spot-check", done: false },
            ],
          },
        ],
      },
      {
        id: "demo-col-1",
        title: "To Do",
        color: VIOLET.value,
        cards: [
          {
            id: "demo-card-1",
            title: "Design landing page",
            description:
              "Create wireframes and high-fidelity mockups for the new landing page",
            color: GOLD.value,
            isDone: false,
            tags: [
              { name: "design", color: PINK.value },
              { name: "web", color: AZURE.value },
            ],
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
            color: CRIMSON.value,
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
            color: TEAL.value,
            isDone: false,
            tags: [{ name: "docs", color: GREEN.value }],
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
            tags: [{ name: "backend", color: CRIMSON.value }],
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
          {
            id: "demo-card-6",
            title: "Realtime notifications",
            description: "WebSocket-powered toast notifications for board updates",
            color: PINK.value,
            isDone: false,
            tags: [{ name: "feature", color: AZURE.value }],
            tasks: [
              { text: "Set up WebSocket server", done: true },
              { text: "Client subscription layer", done: false },
              { text: "Toast UI + throttling", done: false },
              { text: "Reconnect handling", done: false },
            ],
          },
        ],
      },
      {
        id: "demo-col-3",
        title: "Review",
        color: PINK.value,
        cards: [
          {
            id: "demo-card-7",
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
          {
            id: "demo-card-8",
            title: "Onboarding flow copy",
            description: "",
            color: VIOLET.value,
            isDone: false,
            tags: [{ name: "content", color: GOLD.value }],
            tasks: [
              { text: "Draft welcome screen copy", done: true },
              { text: "Review with stakeholders", done: false },
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
            id: "demo-card-9",
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
            id: "demo-card-10",
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
          {
            id: "demo-card-11",
            title: "Set up analytics",
            description: "",
            color: AZURE.value,
            isDone: true,
            tags: [{ name: "infra", color: GRAPHITE.value }],
            tasks: [
              { text: "Choose analytics provider", done: true },
              { text: "Wire page-view events", done: true },
            ],
          },
          {
            id: "demo-card-12",
            title: "Write launch checklist",
            description: "",
            color: PINK.value,
            isDone: true,
            tasks: [
              { text: "List go-live steps", done: true },
              { text: "Assign owners", done: true },
              { text: "Schedule dry run", done: true },
            ],
          },
          {
            id: "demo-card-13",
            title: "Fix login redirect bug",
            description: "Users were bounced to /login after OAuth callback",
            color: CRIMSON.value,
            isDone: true,
            tasks: [{ text: "Patch callback handler", done: true }],
          },
        ],
      },
    ],
  },
];
