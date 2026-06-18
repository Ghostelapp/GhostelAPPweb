import { useEffect } from "react";

const SITE_URL = "https://ghostel.app";
const DEFAULT_IMAGE = `${SITE_URL}/ghostel-logo.png`;

function setMeta(attribute, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(url) {
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", url);
}

export default function Seo({
  title = "ghostel.app | Private encrypted messaging",
  description = "Private encrypted conversations, voice calls, push notifications, and secure contact management in one app.",
  path = "/",
  robots = "index, follow",
}) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path === "/" ? "" : path}`;
    document.title = title;
    setCanonical(canonicalUrl);
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", DEFAULT_IMAGE);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", DEFAULT_IMAGE);
  }, [title, description, path, robots]);

  return null;
}
