# Gumlet

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Integration Docs

Please find the full integration docs at this [link](https://docs.gumlet.com/docs/drm-with-reactjs)

### `npm start`

To run the this application please make the following changes

File: `src/App.js`

```
// ADAPT: `fairplayLicenseAndCertificateURI` to your server URI to fetch the fairplay
// licence and certificate from
const fairplayLicenseAndCertificateURI = "https://example.com/fairplay-licence-and-certificate-url";

// ADAPT: `widevineLicenseURI` to your server URI to fetch the widevine licence
const widevineLicenseURI = "https://example.com/widevine-licence-url";

// ADAPT: `videoURI` to your video URL
const videoURI = "https://video.gumlet.com/example-hls-manifest";
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
