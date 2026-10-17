// Returns a fresh TikTok thumbnail for a video URL.
// TikTok's thumbnail links expire, so we look it up via oEmbed on demand and redirect to it.
// Usage: <img src="/.netlify/functions/tiktok-thumb?url=https://www.tiktok.com/@user/video/123" />
exports.handler = async function (event) {
  const videoUrl = (event.queryStringParameters || {}).url || "";
  let host = "";
  try { host = new URL(videoUrl).hostname; } catch (e) { /* invalid url */ }
  if (!/(^|\.)tiktok\.com$/.test(host)) {
    return { statusCode: 400, body: "Not a TikTok URL" };
  }
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`);
    const data = await res.json();
    if (!data.thumbnail_url) return { statusCode: 404, body: "No thumbnail" };
    return {
      statusCode: 302,
      headers: { Location: data.thumbnail_url, "Cache-Control": "public, max-age=21600" },
      body: "",
    };
  } catch (e) {
    return { statusCode: 502, body: "Lookup failed" };
  }
};
