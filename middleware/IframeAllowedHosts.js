import dotenv from "dotenv";
dotenv.config();

const allowedHosts = process.env.ALLOWED_IFRAME_HOSTS?.split(",") || [];

function IframeAllowedHosts(req, res, next) {
  const referer = req.headers.referer || "";
  const baseUrl = req.protocol + "://" + (req.headers.host || "");
  const resourcePath =
    baseUrl + req.originalUrl.split("/").slice(0, -1).join("/");
  res.setHeader("Cache-Control", "no-store");

  if (allowedHosts.some((host) => referer.startsWith(host))) {
    return next();
  }

  if (referer.startsWith(resourcePath)) {
    return next();
  }
  if (req.originalUrl.startsWith("/projects")) {
    return res.status(403).send("Forbidden");
  }
  return res.status(403).send("Forbidden");
}

export { IframeAllowedHosts };