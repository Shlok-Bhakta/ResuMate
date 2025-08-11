import { get } from "svelte/store";
import {
  name,
  email,
  phone,
  website,
  linkedin,
  github,
  address,
  enableEmail,
  enablePhone,
  enableWebsite,
  enableLinkedin,
  enableGithub,
  enableAddress,
  showUSCitizenship,
  header
} from "./stores";

/**
 * Build the dynamic resume header markdown and update the persisted header store.
 * Mirrors original implementation while isolating responsibility.
 */
export function createHeader(): void {
  let parts: string[] = [];

  // Primary name header
  parts.push("# " + get(name));

  const infoSegments: string[] = [];

  if (get(enablePhone)) {
    infoSegments.push(
      "![Phone](https://shlok-bhakta.github.io/ResuMate/icons/phone.svg) " + get(phone)
    );
  }
  if (get(enableEmail)) {
    const em = get(email);
    infoSegments.push(
      "![Mail](https://shlok-bhakta.github.io/ResuMate/icons/mail.svg) [" + em + "](mailto:" + em + ")"
    );
  }
  if (get(enableAddress)) {
    infoSegments.push(
      "![Globe](https://shlok-bhakta.github.io/ResuMate/icons/globe.svg) " + get(address)
    );
  }
  if (get(enableWebsite)) {
    const site = get(website);
    infoSegments.push(
      "![Website](https://shlok-bhakta.github.io/ResuMate/icons/internet.svg) [" + site + "](https://" + site + ")"
    );
  }
  if (get(enableGithub)) {
    const gh = get(github);
    infoSegments.push(
      "![Github](https://shlok-bhakta.github.io/ResuMate/icons/github.svg) [" + gh + "](https://" + gh + ")"
    );
  }
  if (get(enableLinkedin)) {
    const li = get(linkedin);
    infoSegments.push(
      "![Linkedin](https://shlok-bhakta.github.io/ResuMate/icons/linkedin.svg) [" + li + "](https://" + li + ")"
    );
  }
  if (get(showUSCitizenship)) {
    infoSegments.push(
      "![Passport](https://shlok-bhakta.github.io/ResuMate/icons/passport.svg) US CITIZEN"
    );
  }

  if (infoSegments.length > 0) {
    parts.push(""); // blank line
    parts.push("#### " + infoSegments.join(" | "));
  }

  // Final spacing so downstream markdown does not merge
  parts.push("", "");

    // Update the store
  header.set(parts.join("\n"));
  // console.log(get(header));
}