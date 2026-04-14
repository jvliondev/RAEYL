/**
 * CMS bridge service.
 * Generates the correct editor URL for a given CMS provider so the owner
 * can be sent directly to the right editing interface without logging into
 * multiple platforms.
 */

export type CMSProvider = "sanity" | "contentful" | "webflow" | "tina" | "builder" | "payload" | "custom";

export type CMSBridgeConfig = {
  provider: CMSProvider;
  projectId?: string;       // Sanity project ID, Contentful space ID, etc.
  dataset?: string;         // Sanity dataset (usually "production")
  studioUrl?: string;       // For self-hosted studios (Sanity embedded, Payload, TinaCMS)
  spaceId?: string;         // Contentful space ID
  environment?: string;     // Contentful environment
  contentTypeId?: string;   // Jump directly to a content type
  entryId?: string;         // Jump directly to a specific entry
  siteId?: string;          // Webflow site ID
};

/**
 * Build a direct editor URL for a given CMS configuration.
 * Returns the URL the owner should click to start editing.
 */
export function buildCMSEditorUrl(config: CMSBridgeConfig): string | null {
  switch (config.provider) {
    case "sanity": {
      if (config.studioUrl) {
        // Self-hosted or embedded studio
        const base = config.studioUrl.replace(/\/$/, "");
        if (config.contentTypeId) return `${base}/structure/${config.contentTypeId}`;
        return base;
      }
      if (config.projectId) {
        const dataset = config.dataset ?? "production";
        const base = `https://${config.projectId}.sanity.studio`;
        if (config.contentTypeId) return `${base}/structure/${config.contentTypeId}`;
        return base;
      }
      return "https://sanity.io/manage";
    }

    case "contentful": {
      if (config.spaceId) {
        const env = config.environment ?? "master";
        if (config.entryId) {
          return `https://app.contentful.com/spaces/${config.spaceId}/environments/${env}/entries/${config.entryId}`;
        }
        if (config.contentTypeId) {
          return `https://app.contentful.com/spaces/${config.spaceId}/environments/${env}/content_types/${config.contentTypeId}/entries`;
        }
        return `https://app.contentful.com/spaces/${config.spaceId}`;
      }
      return "https://app.contentful.com";
    }

    case "webflow": {
      if (config.siteId) {
        return `https://webflow.com/design/${config.siteId}`;
      }
      return "https://webflow.com/dashboard";
    }

    case "tina": {
      if (config.studioUrl) {
        const base = config.studioUrl.replace(/\/$/, "");
        return `${base}/index.html`;
      }
      return null;
    }

    case "builder": {
      return "https://builder.io/content";
    }

    case "payload": {
      if (config.studioUrl) {
        return `${config.studioUrl}/admin`;
      }
      return null;
    }

    default:
      return config.studioUrl ?? null;
  }
}

/**
 * Detect the likely CMS provider from a provider connection's metadata or name.
 */
export function detectCMSProvider(providerName: string, metadata?: Record<string, unknown>): CMSProvider | null {
  const name = providerName.toLowerCase();
  if (name.includes("sanity")) return "sanity";
  if (name.includes("contentful")) return "contentful";
  if (name.includes("webflow")) return "webflow";
  if (name.includes("tina") || name.includes("tinacms")) return "tina";
  if (name.includes("builder")) return "builder";
  if (name.includes("payload")) return "payload";
  return null;
}

/**
 * Get a human-readable description of what the owner can do in this CMS.
 */
export function getCMSOwnerDescription(provider: CMSProvider): string {
  switch (provider) {
    case "sanity":
      return "Edit your website content — text, images, and structured content — from Sanity Studio. No technical knowledge needed.";
    case "contentful":
      return "Update your website content from Contentful. Add, edit, or remove entries and media.";
    case "webflow":
      return "Edit your website design and content directly from Webflow's visual editor.";
    case "tina":
      return "Edit your website content using TinaCMS — changes appear live on your site.";
    case "builder":
      return "Drag and drop to edit your website content using Builder.io's visual editor.";
    case "payload":
      return "Manage your website content from the Payload CMS admin panel.";
    default:
      return "Edit your website content from the connected content management system.";
  }
}
