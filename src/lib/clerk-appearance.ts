export const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(158 43% 19%)",
    colorText: "hsl(155 30% 12%)",
    colorBackground: "hsl(40 33% 97%)",
    colorInputBackground: "hsl(0 0% 100%)",
    colorInputText: "hsl(155 30% 12%)",
    borderRadius: "0.5rem",
  },
  elements: {
    card: "shadow-card border border-border rounded-xl",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-all",
    footerActionLink: "text-accent hover:text-accent/90",
    formFieldInput:
      "rounded-lg border border-border shadow-sm focus:ring-2 focus:ring-primary/20",
    headerTitle: "text-foreground font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
  },
};
