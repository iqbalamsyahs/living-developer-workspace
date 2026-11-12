"use client";

import { getOverlayRoot } from "./overlayRoot";
import { useRef, type FormEvent, type RefObject } from "react";
import { Html } from "@react-three/drei";
import {
  ArrowTopRightIcon,
  Cross2Icon,
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  InstagramLogoIcon,
  Link1Icon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import type { ContentItem } from "@/lib/portfolio";
import { Button } from "../ui/Button";

interface ContactScreenProps {
  /** World-space anchor: the phone screen center. The panel sticks to it and
   *  follows the camera, so it reads as content rendered on the phone. */
  position: [number, number, number];
  /** Pixel size of the rendered panel. Sized from the phone display's world
   *  bounds so the panel overlays the actual screen. */
  widthPx: number;
  heightPx: number;
  content: ContentItem;
  onClose: () => void;
}

// Panel is a fraction of the phone display's projected size. 0.8 keeps it
// clearly inside the display (visible bezel all around). The projector now
// returns true viewport pixels (it previously reported 2x too big, which is
// why the panel overflowed the phone).
const GLASS_SCALE = 0.8;

// Subtitle + quick-action labels are the reference copy; the actual email and
// social URLs come from the CMS contact item.
const SUBTITLE = "Connect with Me Today. Let's Create Something Amazing Together!";

// Last path segment of a profile URL → display handle ("ibang" from
// "https://github.com/ibang"). Falls back to the full URL when empty.
const handleFromUrl = (url?: string) => {
  if (!url) return "";
  const clean = url.replace(/\/+$/, "");
  const seg = clean.split("/").pop();
  return seg && seg.length > 0 ? seg : url;
};

// Platform name (lowercase, as typed in the CMS) → Radix icon. Names not in
// the map (typos, new platforms) fall back to the generic link icon, so an
// unknown platform still renders instead of crashing.
const SOCIAL_ICONS: Record<string, typeof GitHubLogoIcon> = {
  github: GitHubLogoIcon,
  linkedin: LinkedInLogoIcon,
  x: TwitterLogoIcon,
  twitter: TwitterLogoIcon,
  instagram: InstagramLogoIcon,
};

/**
 * Contact panel rendered on the phone in 3D space: header, message form, and
 * social cards. Same drei <Html> anchor as ShowcaseScreen — the camera parks
 * perpendicular to the phone display (facing +Y), so the billboarded panel
 * overlays the screen exactly. The form submits via mailto: (no backend):
 * it pre-fills the user's mail client with the subject/body from the fields.
 */
export function ContactScreen({
  position,
  widthPx,
  heightPx,
  content,
  onClose,
}: ContactScreenProps) {
  const portalRef = useRef<HTMLElement | null>(null);
  // drei Html resolves `portal.current` during render, so initialize the ref
  // in render, not an effect (same as ShowcaseScreen).
  if (portalRef.current === null) portalRef.current = getOverlayRoot();

  const contact = content.contact;
  const email = contact?.email;

  // Dynamic from the CMS: any platform, any count. _key is the stable React
  // key Sanity assigns each array item; platform is the display name and the
  // icon-map lookup key.
  const socials = (contact?.socials ?? []).map((s) => ({
    id: s._key ?? s.platform,
    name: s.platform,
    href: s.url,
    handle: handleFromUrl(s.url),
    icon: SOCIAL_ICONS[s.platform.toLowerCase()] ?? Link1Icon,
  }));
  console.log(contact, "contact");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string)?.trim() || "";
    const sender = (fd.get("email") as string)?.trim() || "";
    const message = (fd.get("message") as string)?.trim() || "";
    const subject = `Contact from ${name || sender || "your portfolio"}`;
    const body = `${message}\n\n— ${name || sender}`;
    // mailto: per decision — no email backend. Pre-fills the client.
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const inputClass =
    "w-full rounded-sm border border-primary/50 bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60";

  return (
    <Html
      portal={portalRef as RefObject<HTMLElement>}
      zIndexRange={[30, 0]}
      center
      position={position}
      occlude={false}
    >
      <div
        style={{ width: widthPx * GLASS_SCALE, height: heightPx * GLASS_SCALE }}
        className="pointer-events-auto flex flex-col overflow-hidden bg-transparent"
      >
        {/* Header: title, subtitle, quick actions, close. Sticky so it stays
            put while the form/socials scroll underneath. */}
        <div className="shrink-0 border-b border-primary/10 p-3 backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <EnvelopeClosedIcon
                width={16}
                height={16}
                aria-hidden="true"
                className="shrink-0 text-primary"
              />
              <h2 className="truncate font-display text-sm leading-none text-text-primary">
                I Love to hear from you.
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close contact screen"
              onClick={onClose}
              className="shrink-0 p-1"
            >
              <Cross2Icon width={14} height={14} aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-text-secondary">{SUBTITLE}</p>
          {/* <div className="mt-2 flex gap-2">
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-primary/60 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-ink"
              >
                <EnvelopeClosedIcon width={13} height={13} aria-hidden="true" />
                Email Me
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}?subject=${encodeURIComponent("Scheduling a call")}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-primary/60 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-ink"
              >
                Schedule Call
              </a>
            )}
          </div> */}
        </div>

        {/* Scroll body: form then social cards */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-text-secondary">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-text-secondary">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-text-secondary">Message</span>
              <textarea
                name="message"
                required
                rows={3}
                placeholder="Tell me about your project…"
                className={`${inputClass} resize-none`}
              />
            </label>
            <Button type="submit" className="w-full">
              Send Your Message
            </Button>
          </form>

          {socials.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-sm border border-primary/10 bg-background/20 px-2.5 py-2 transition-colors hover:border-primary/50"
                >
                  <s.icon
                    width={16}
                    height={16}
                    aria-hidden="true"
                    className="shrink-0 text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-text-primary">{s.name}</span>
                    <span className="block truncate text-[10px] text-text-secondary">{s.handle}</span>
                  </span>
                  <ArrowTopRightIcon
                    width={13}
                    height={13}
                    aria-hidden="true"
                    className="shrink-0 text-text-secondary/60"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Html>
  );
}
